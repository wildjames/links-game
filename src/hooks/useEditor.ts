import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Buffer } from 'buffer'
import { SnackbarCloseReason } from '@mui/material'

import { PATHS } from '@constants/environment'
import { GameState, GridTile, WordCategory } from '@utils/commonTypes'
import {
    checkGameDefinition,
    checkIfValidUUIDv4,
    fetchGameState,
    storeGameState,
    validateWord
} from '@utils/utils'

const MAX_ROWS = 10
const MAX_COLUMNS = 10
const AUTOSAVE_DELAY = 1000 * 5 // 5 seconds

const useEditor = () => {
    // --- CORE STATE ---
    const [words, setWords] = useState<string[][]>(
        Array.from({ length: MAX_ROWS }, () => Array(MAX_COLUMNS).fill(''))
    )
    const [categoryNames, setCategoryNames] = useState<string[]>(
        Array.from({ length: MAX_ROWS }, () => '')
    )
    const [rows, setRows] = useState(4)
    const [categorySize, setCategorySize] = useState(4)
    const [editingTileId, setEditingTileId] = useState<string>()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [gameDefinition, setGameDefinition] = useState<string>()
    const [gameId, setGameId] = useState<string>()
    const [validGame, setValidGame] = useState(false)
    const [validationError, setValidationError] = useState<string | null>(null)

    const [searchParams, setSearchParams] = useSearchParams()
    const saveTimerRef = useRef<number | null>(null)

    // --- DERIVED GRID ---
    const grid = useMemo<GridTile[][]>(() => {
        return Array.from({ length: rows }, (_, r) =>
            Array.from({ length: categorySize }, (_, c) => ({
                id: `${r}-${c}`,
                word: words[r]?.[c] ?? '',
            }))
        )
    }, [words, rows, categorySize])

    // --- DERIVED CATEGORIES ---
    const categories = useMemo<WordCategory[]>(() => {
        return Array.from({ length: rows }, (_, r) => ({
            categoryName: categoryNames[r] || 'Category ' + (r + 1),
            wordArray: words[r].slice(0, categorySize)
                .map(w => {
                    const decoded = decodeURIComponent(w.trim())
                    return validateWord(decoded) ? decoded : ''
                }),
        }))
    }, [words, rows, categorySize, categoryNames])

    // --- SYNC URL AND STATE (once) ---
    useEffect(() => {
        const parseGame = async () => {
            const payload = searchParams.get('data')
            if (!payload) return

            let parsed: GameState | undefined = undefined
            // If the data is a UUID, we need to fetch the game state from the backend
            if (payload.length === 36) {
                if (checkIfValidUUIDv4(payload)) {
                    try {
                        const data = await fetchGameState(payload)
                        if (!data) {
                            console.error('Failed to fetch game state')
                            return
                        }
                        console.log('Fetched game state:', data)
                        const text = Buffer.from(data.game_encoding, 'base64').toString('utf8')
                        if (!text) {
                            console.error('Invalid response from the server', data)
                            return
                        }
                        parsed = JSON.parse(text)
                    } catch (err) {
                        console.error('Failed to fetch game state:', err)
                        return
                    }
                } else {
                    console.error('Invalid game ID:', payload)
                    return
                }
            } else {
                // If the data is not a UUID, we assume it's a base64 encoded game state
                const text = Buffer.from(payload, 'base64').toString('utf8')
                parsed = JSON.parse(text)
                if (!parsed) {
                    console.error('Failed to parse game state from URL')
                    return
                }

                // Stash the game state to the backend
                try {
                    const id = await storeGameState(parsed.categories, parsed.rows, parsed.categorySize)
                    if (id) {
                        setGameId(id)
                    } else {
                        console.error('Auto-save: no game ID returned')
                    }
                } catch (err) {
                    console.error('Auto-save failed:', err)
                }
            }

            if (!parsed) return

            try {
                // initialize rows and columns
                setRows(parsed.rows)
                setCategorySize(parsed.categorySize)

                // build fresh words grid
                const flat = parsed.categories
                    .flatMap(cat => cat.wordArray)
                    .map(w => validateWord(decodeURIComponent(w.trim())) ? w : '')
                const newWords = Array.from({ length: MAX_ROWS }, () =>
                    Array(MAX_COLUMNS).fill('')
                )
                for (let r = 0; r < parsed.rows; r++) {
                    for (let c = 0; c < parsed.categorySize; c++) {
                        const idx = r * parsed.categorySize + c
                        newWords[r][c] = flat[idx] || ''
                    }
                }
                setWords(newWords)
                setCategoryNames(parsed.categories.map(cat => cat.categoryName))
            } catch (err) {
                console.error('Failed to parse game data from URL', err)
            }
        }

        setLoading(true)
        parseGame()
            .catch(err => {
                console.error('Error parsing game data from URL', err)
            })
            .finally(() => {
                setLoading(false)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])  // run only on mount


    // --- UPDATE URL AND GAME DEFINITION ---
    useEffect(() => {
        // If all categories are empty, don't update the game definition
        if (categories.every(cat => cat.wordArray.every(word => word === ''))) {
            setGameDefinition(undefined)
            setSearchParams({}, { replace: true })
            return
        }

        const stateObj: GameState = {
            categories,
            rows,
            categorySize,
        }

        const json = JSON.stringify(stateObj)
        const b64 = Buffer.from(json, 'utf8').toString('base64')

        setGameDefinition(b64)
        setSearchParams({ data: b64 }, { replace: true })

        // After a period of inactivity, save the game state to the backend
        if (saveTimerRef.current !== null) {
            clearTimeout(saveTimerRef.current)
        }
        saveTimerRef.current = window.setTimeout(async () => {
            try {
                const id = await storeGameState(categories, rows, categorySize)
                if (id) {
                    setGameId(id)
                } else {
                    console.error('Auto-save: no game ID returned')
                }
            } catch (err) {
                console.error('Auto-save failed:', err)
            }
            saveTimerRef.current = null
        }, AUTOSAVE_DELAY)

        // Clean up on unmount or before next effect run
        return () => {
            if (saveTimerRef.current !== null) {
                clearTimeout(saveTimerRef.current)
                saveTimerRef.current = null
            }
        }
    }, [categories, rows, categorySize, categoryNames, setSearchParams])

    useEffect(() => {
        try {
            checkGameDefinition({
                categories,
                rows,
                categorySize,
            })
            setValidGame(true)
        } catch (err) {
            if (err instanceof Error) {
                console.warn('Invalid game definition:', err.message)
                setValidationError(err.message)
            } else console.warn('Invalid game definition:', err)
            setValidGame(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameDefinition])

    // --- HANDLERS ---
    const handleTileClick = useCallback((tile: GridTile) => {
        setEditingTileId(id => (id === tile.id ? undefined : tile.id))
    }, [])

    const handleTileTextChange = useCallback((tileId: string, text: string) => {
        const [r, c] = tileId.split('-').map(Number)
        setWords(ws =>
            ws.map((row, ri) =>
                row.map((w, ci) => (ri === r && ci === c ? text : w))
            )
        )
    }, [])

    const copyGameLink = useCallback(async () => {
        const gameId = await storeGameState(categories, rows, categorySize)
        if (!gameId) {
            console.error('Failed to store game state')
            return
        }

        navigator.clipboard.writeText(
            `${window.location.origin}${PATHS.GAME}?data=${gameId}`
        )
        setGameId(gameId)
        setOpen(true)
    }, [categories, categorySize, rows])

    const handleCloseSnackbar = useCallback(
        (_event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
            if (reason !== 'clickaway') setOpen(false)
        },
        []
    )

    const handleClearWords = () => {
        setWords(Array.from({ length: MAX_ROWS }, () => Array(MAX_COLUMNS).fill('')))
        setEditingTileId(undefined)
    }

    const handleGoToGame = async () => {
        const gameId = await storeGameState(categories, rows, categorySize)
        window.open(
            `${window.location.origin}${PATHS.GAME}?data=${gameId ?? gameDefinition}`,
            '_blank'
        )
    }

    return {
        rows,
        setRows,
        categorySize,
        setCategorySize,
        categoryNames,
        setCategoryNames,
        grid,
        editingTileId,
        handleTileClick,
        handleTileTextChange,
        copyGameLink,
        open,
        loading,
        handleCloseSnackbar,
        handleClearWords,
        handleGoToGame,
        gameDefinition,
        gameId,
        validGame,
        validationError,
    }
}

export default useEditor
