import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Buffer } from 'buffer'
import { SnackbarCloseReason } from '@mui/material'

import { PATHS } from '@constants/environment'
import { GameState, GridTile, WordCategory } from '@utils/commonTypes'
import { checkGameDefinition, validateWord } from '@utils/utils'

const MAX_ROWS = 10
const MAX_COLUMNS = 10

const useEditor = () => {
    // --- CORE STATE ---
    const [words, setWords] = useState<string[][]>(
        Array.from({ length: MAX_ROWS }, () => Array(MAX_COLUMNS).fill(''))
    )
    const [rows, setRows] = useState(4)
    const [categorySize, setCategorySize] = useState(4)
    const [editingTileId, setEditingTileId] = useState<string>()
    const [open, setOpen] = useState(false)
    const [gameDefinition, setGameDefinition] = useState<string>()
    const [validGame, setValidGame] = useState(false)
    const [validationError, setValidationError] = useState<string | null>(null)

    const [searchParams, setSearchParams] = useSearchParams()

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
            categoryName: `Category ${r + 1}`,
            wordArray: words[r].slice(0, categorySize)
                .map(w => {
                    const decoded = decodeURIComponent(w.trim())
                    return validateWord(decoded) ? decoded : ''
                }),
        }))
    }, [words, rows, categorySize])

    // --- SYNC URL AND STATE (once) ---
    useEffect(() => {
        const payload = searchParams.get('data')
        if (!payload) return

        try {
            const text = Buffer.from(payload, 'base64').toString('utf8')
            const parsed: GameState = JSON.parse(text)

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
        } catch (err) {
            console.error('Failed to parse game data from URL', err)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])  // run only on mount


    // --- UPDATE URL AND GAME DEFINITION ---
    useEffect(() => {
        const stateObj: GameState = {
            categories,
            rows,
            categorySize,
        }

        const json = JSON.stringify(stateObj)
        const b64 = Buffer.from(json, 'utf8').toString('base64')

        setGameDefinition(b64)
        setSearchParams({ data: b64 }, { replace: true })
        // update the URL whenever the game state changes
    }, [categories, rows, categorySize, setSearchParams])

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

    const copyGameLink = useCallback(() => {
        navigator.clipboard.writeText(
            `${window.location.origin}${PATHS.GAME}?data=${gameDefinition}`
        )
        setOpen(true)
    }, [gameDefinition])

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

    return {
        rows,
        setRows,
        categorySize,
        setCategorySize,
        grid,
        editingTileId,
        handleTileClick,
        handleTileTextChange,
        copyGameLink,
        open,
        handleCloseSnackbar,
        handleClearWords,
        gameDefinition,
        validGame,
        validationError,
    }
}

export default useEditor
