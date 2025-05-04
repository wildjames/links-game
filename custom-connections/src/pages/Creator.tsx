import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { Buffer } from 'buffer'

import Button from '@mui/material/Button'
import { Snackbar, SnackbarCloseReason } from '@mui/material'

import '@styles/Creator.scss'
import { PATHS } from '@constants/environment'
import Grid, { GridTile } from '@components/Grid'
import GroupedButtons from '@components/GroupedButtons'

import { checkGameDefinition, validateWord } from '@utils/utils'
import { WordCategory, GameState } from '@utils/commonTypes'

const MAX_ROWS = 10
const MAX_COLUMNS = 10

const CreatorPage = () => {
    // Create a fixed 10x10 words array (2D array) with empty strings.
    // This will be sparsely filled with words, and only the relevant section will be used
    const [words, setWords] = useState<string[][]>(
        Array.from({ length: MAX_ROWS }, () => Array(MAX_COLUMNS).fill(''))
    )
    const [categories, setCategories] = useState<WordCategory[]>([])

    const [rows, setRows] = useState(4)
    const [columns, setColumns] = useState(4)
    const [categorySize, setCategorySize] = useState(4)

    // The grid we care about is the window of the full 10×10 words array.
    const [grid, setGrid] = useState<GridTile[][]>([])

    const [editingTileId, setEditingTileId] = useState<string | null>(null)
    const [gameDefinition, setGameDefinition] = useState<string>('')

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

    // On mount, parse the query string to update the game definition.
    useEffect(() => {
        const payload = searchParams.get('data')
        if (!payload) {
            console.error('No data found in the URL')
            return
        }

        const data = Buffer.from(payload, "base64").toString('utf-8')
        const parsedData: GameState = JSON.parse(data)
        console.debug('Parsed data:', parsedData)

        // This will throw an error if the game definition is invalid.
        checkGameDefinition(parsedData)

        const parsedWords = parsedData.categories
            .flatMap(category => category.wordArray)
            .map(word => decodeURIComponent(word.trim()))
            .filter(word => validateWord(word))

        setRows(parsedData.rows)
        setColumns(parsedData.columns)
        // Since we're editing, each row will be designated as a category.
        setCategorySize(parsedData.columns)
        setCategories(parsedData.categories)

        // Place the words into the grid, so that they're in the defined subsection
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

    // Ensure columns always match the category size.
    useEffect(() => {
        setColumns(categorySize)
    }, [categorySize])

    useEffect(() => {
        const newCategories = Array.from({ length: rows }, (_, i) => ({
            categoryName: `Category ${i + 1}`,
            wordArray: words[i].slice(0, categorySize)
        }))
        setCategories(newCategories)
        console.debug('Categories:', newCategories)
    }, [words, rows, categorySize])

    // When a tile is clicked, toggle its edit mode.
    const handleTileClick = (tile: GridTile) => {
        if (editingTileId === tile.id) {
            setEditingTileId(null)
        } else {
            setEditingTileId(tile.id)
        }
    }

    // Update the text for a tile by mapping its full-grid indices.
    const handleTileTextChange = (tileId: string, newText: string) => {
        console.debug
        const [r, c] = tileId.split('-').map(Number)
        setWords(prevWords =>
            prevWords.map((row, rowIndex) =>
                row.map((word, colIndex) =>
                    rowIndex === r && colIndex === c ? newText : word
                )
            )
        )
    }

    // Generate a game definition string using only the defined window.
    const generateGameDefinition = () => {
        try {
            checkGameDefinition({
                categories,
                rows,
                columns,
                categorySize
            })
        }
        catch (error) {
            console.error('Invalid game definition:', error)
            alert('Invalid game definition. Please check your input.')
            return
        }

        const gameDefinitionObj: GameState = {
            categories,
            rows,
            columns,
            categorySize
        }

        const jsonString = JSON.stringify(gameDefinitionObj)
        const base64String = Buffer.from(jsonString, 'utf-8').toString('base64')

        setGameDefinition(base64String)
        navigator.clipboard.writeText(`http://localhost:3000${PATHS.GAME}?data=${gameDefinition}`)
        setOpen(true)
    }

    const handleClose = (
        _event: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => {
        if (reason === 'clickaway') return
        setOpen(false)
    }

    return (
        <div className="creator-page">
            <h1>links</h1>
            <h2>game creator</h2>

            <div className="controls">
                <GroupedButtons
                    counter={rows}
                    setCounter={setRows}
                    min={2}
                    max={10}
                    label="Rows"
                />

                <GroupedButtons
                    counter={categorySize}
                    setCounter={setCategorySize}
                    min={2}
                    max={10}
                    label="Category Size"
                />
            </div>

            <Grid
                grid={grid}
                handleTileClick={handleTileClick}
                editingTileId={editingTileId || undefined}
                onTileTextChange={handleTileTextChange}
            />

            <div className="controls">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={generateGameDefinition}
                >
                    Generate Game Definition
                </Button>
            </div>

            {gameDefinition && (
                <div className="game-definition">
                    <Link
                        to={`${PATHS.GAME}?data=${gameDefinition}`}
                        target="_blank"
                    >
                        Go to game
                    </Link>
                </div>
            )}

            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                message="Copied to clipboard!"
            />

        </div>
    )
}

export default CreatorPage
