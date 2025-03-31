import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Buffer } from 'buffer'

import Button from '@mui/material/Button'
import { Snackbar, SnackbarCloseReason } from '@mui/material'

import '@styles/Creator.scss'
import Grid, { GridTile } from '@components/Grid'

import { validateWord, shuffle } from '@utils/utils'
import { WordCategory, GameState } from './Game'


const CreatorPage = () => {
    const [rows, setRows] = useState(4)
    const [columns, setColumns] = useState(4)
    const [categorySize, setCategorySize] = useState(4)

    const [words, setWords] = useState<string[]>([])
    const [categories, setCategories] = useState<WordCategory[]>([])

    // Initialize a 4x4 grid with empty words.
    const [grid, setGrid] = useState<GridTile[][]>(
        Array.from({ length: rows }, (_, rowIndex) =>
            Array.from({ length: columns }, (_, colIndex) => ({
                id: `${rowIndex}-${colIndex}`,
                word: ''
            }))
        )
    )

    const [editingTileId, setEditingTileId] = useState<string | null>(null)
    const [gameDefinition, setGameDefinition] = useState<string>('')

    const [open, setOpen] = useState(false);

    const [searchParams] = useSearchParams()

    useEffect(() => {
        // Only update if we have everything we need.
        if (!rows || !columns || !words.length) {
            return
        }

        // Create a grid of tile objects.
        const newGrid = Array.from({ length: rows }, (_, rowIndex) =>
            Array.from({ length: columns }, (_, colIndex) => {
                const index = rowIndex * columns + colIndex
                return {
                    id: `${rowIndex}-${colIndex}`,
                    word: words[index] || '',
                }
            })
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
        // FIXME: Re-enable this when the creator is more functional
        // checkGameDefinition(parsedData)

        const parsedWords = parsedData.words
            .map(word => decodeURIComponent(word.trim()))
            .filter(word => validateWord(word))
        shuffle(parsedWords)

        // Set the states once we know all is well
        setWords(parsedWords)
        setCategories(parsedData.categories)

        setRows(parsedData.rows)
        setColumns(parsedData.columns)
        setCategorySize(parsedData.categorySize)
    }, [searchParams])

    // When a tile is clicked, toggle it into (or out of) edit mode.
    const handleTileClick = (tile: GridTile) => {
        if (editingTileId === tile.id) {
            // Exit edit mode.
            setEditingTileId(null)
        } else {
            // Enter edit mode for the clicked tile.
            setEditingTileId(tile.id)
        }
    }

    // Update the text of a tile.
    const handleTileTextChange = (tileId: string, newText: string) => {
        setGrid(prevGrid =>
            prevGrid.map(row =>
                row.map(tile =>
                    tile.id === tileId ? { ...tile, word: newText } : tile
                )
            )
        )
    }

    // Generate a game definition string (similar to your GameState)
    const generateGameDefinition = () => {
        // This will throw an error if the game definition is invalid.
        // FIXME: Re-enable this when the creator is more functional
        // checkGameDefinition(parsedData)

        // Flatten grid words, trimming and encoding each.
        const words = grid
            .flat()
            .map(tile => encodeURIComponent(tile.word.trim()))
        const gameDefinitionObj = {
            words,
            categories: [], // FIXME: empty for now
            rows,
            columns,
            categorySize
        }
        const jsonString = JSON.stringify(gameDefinitionObj)
        const base64String = Buffer.from(jsonString, 'utf-8').toString('base64')
        setGameDefinition(base64String)
        navigator.clipboard.writeText(base64String)
        setOpen(true)
    }

    const handleClose = (
        _event: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => {
        if (reason === 'clickaway') {
            return
        }

        setOpen(false);
    }

    return (
        <div className="creator-page">
            <h1>links game creator</h1>
            <Grid
                grid={grid}
                handleTileClick={handleTileClick}
                editingTileId={editingTileId || undefined}
                onTileTextChange={handleTileTextChange}
            />

            <Button
                variant="contained"
                color="primary"
                onClick={generateGameDefinition}
            >
                Generate Game Definition
            </Button>

            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                message="Copied to clipboard!"
            />

            {gameDefinition && (
                <div className="game-definition">
                    <h2>Game Definition String</h2>
                    <textarea
                        value={gameDefinition}
                        readOnly
                        rows={1}
                        cols={50}
                    />
                </div>
            )}
        </div>
    )
}

export default CreatorPage
