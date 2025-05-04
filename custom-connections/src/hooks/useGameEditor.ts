import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Buffer } from 'buffer'

import { SnackbarCloseReason } from '@mui/material'

import { PATHS } from '@constants/environment'
import { GameState, WordCategory } from '@utils/commonTypes'
import { checkGameDefinition, validateWord } from '@utils/utils'

import { CreatorGridTile } from '@components/CreatorGrid'

const MAX_ROWS = 10
const MAX_COLUMNS = 10

// TODO: Even if the user has made an invalid game, we should still update the editor page link to save their progress.

const useGameEditor = () => {
    const [words, setWords] = useState<string[][]>(
        Array.from({ length: MAX_ROWS }, () => Array(MAX_COLUMNS).fill(''))
    )
    const [categories, setCategories] = useState<WordCategory[]>([])
    const [rows, setRows] = useState(4)
    const [columns, setColumns] = useState(4)
    const [categorySize, setCategorySize] = useState(4)
    const [grid, setGrid] = useState<CreatorGridTile[][]>([])
    const [editingTileId, setEditingTileId] = useState<string | undefined>(undefined)
    const [gameDefinition, setGameDefinition] = useState<string | undefined>(undefined)
    const [open, setOpen] = useState(false)
    const [searchParams] = useSearchParams()

    // Build the grid
    useEffect(() => {
        if (!rows || !columns || !words.length) return

        const newGrid = Array.from({ length: rows }, (_, i) =>
            Array.from({ length: columns }, (_, j) => ({
                id: `${i}-${j}`,
                word: words[i][j] || ''
            }))
        )
        setGrid(newGrid)
    }, [words, rows, columns])

    // Parse game data from the URL
    useEffect(() => {
        const payload = searchParams.get('data')
        setGameDefinition(payload ?? undefined)
        if (!payload) {
            console.error('No data found in the URL')
            return
        }

        const data = Buffer.from(payload, 'base64').toString('utf-8')
        const parsedData: GameState = JSON.parse(data)
        console.debug('Parsed data:', parsedData)

        checkGameDefinition(parsedData)

        const parsedWords = parsedData.categories
            .flatMap(category => category.wordArray)
            .map(word => decodeURIComponent(word.trim()))
            .filter(word => validateWord(word))

        setRows(parsedData.rows)
        setColumns(parsedData.columns)
        setCategorySize(parsedData.columns)
        setCategories(parsedData.categories)

        const newWords = Array.from({ length: MAX_ROWS }, () =>
            Array(MAX_COLUMNS).fill('')
        )

        for (let i = 0; i < parsedData.rows; i++) {
            for (let j = 0; j < parsedData.columns; j++) {
                const index = i * parsedData.columns + j
                newWords[i][j] =
                    index < parsedWords.length ? parsedWords[index] : ''
            }
        }

        setWords(newWords)
    }, [searchParams])

    useEffect(() => {
        setColumns(categorySize)
    }, [categorySize])

    useEffect(() => {
        generateGameDefinition()
    }, [categories])

    useEffect(() => {
        const newCategories = Array.from({ length: rows }, (_, i) => ({
            categoryName: `Category ${i + 1}`,
            wordArray: words[i].slice(0, categorySize)
        }))
        setCategories(newCategories)
    }, [words, rows, categorySize])

    // Generate a game definition string using only the defined window
    const generateGameDefinition = () => {
        console.log('Generating game definition...', words)
        try {
            checkGameDefinition({
                categories,
                rows,
                columns,
                categorySize
            })
        } catch (error) {
            setGameDefinition(undefined)
            return
        }
        console.log('Game definition is valid')

        const gameDefinitionObj: GameState = {
            categories,
            rows,
            columns,
            categorySize
        }

        const jsonString = JSON.stringify(gameDefinitionObj)
        const base64String = Buffer.from(jsonString, 'utf-8').toString('base64')

        setGameDefinition(base64String)

        searchParams.set('data', base64String)
        window.history.replaceState({}, '', `${window.location.pathname}?${searchParams}`)
    }

    const handleTileClick = (tile: CreatorGridTile) => {
        if (editingTileId === tile.id) {
            setEditingTileId(undefined)
        } else {
            setEditingTileId(tile.id)
        }
    }

    const handleTileTextChange = (tileId: string, newText: string) => {
        const [r, c] = tileId.split('-').map(Number)
        setWords(prevWords =>
            prevWords.map((row, rowIndex) =>
                row.map((word, colIndex) =>
                    rowIndex === r && colIndex === c ? newText : word
                )
            )
        )
    }

    const copyGameLink = () => {
        navigator.clipboard.writeText(`http://localhost:3000${PATHS.GAME}?data=${gameDefinition}`)
        setOpen(true)
    }

    const handleCloseSnackbar = (
        _event: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason
    ) => {
        if (reason === 'clickaway') return
        setOpen(false)
    }

    return {
        words,
        categories,
        rows,
        setRows,
        columns,
        categorySize,
        setCategorySize,
        grid,
        editingTileId,
        gameDefinition,
        open,
        handleTileClick,
        handleTileTextChange,
        generateGameDefinition,
        copyGameLink,
        handleCloseSnackbar
    }
}

export default useGameEditor
