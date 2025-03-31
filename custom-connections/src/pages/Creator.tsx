import { useState } from 'react'
import { Buffer } from 'buffer'
import Button from '@mui/material/Button'

import Grid, { GridTile } from '@components/Grid'

import '@styles/Creator.scss'

const CreatorPage = () => {
    const rows = 4
    const cols = 4
    const categorySize = 4

    // Initialize a 4x4 grid with empty words.
    const [grid, setGrid] = useState<GridTile[][]>(
        Array.from({ length: rows }, (_, rowIndex) =>
            Array.from({ length: cols }, (_, colIndex) => ({
                id: `${rowIndex}-${colIndex}`,
                word: ''
            }))
        )
    )

    // Track the id of the tile that is currently being edited.
    const [editingTileId, setEditingTileId] = useState<string | null>(null)
    const [gameDefinition, setGameDefinition] = useState<string>('')

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
        // Flatten grid words, trimming and encoding each.
        const words = grid
            .flat()
            .map(tile => encodeURIComponent(tile.word.trim()))
        const gameDefinitionObj = {
            words,
            categories: [], // FIXME: empty for now
            rows,
            columns: cols,
            categorySize
        }
        const jsonString = JSON.stringify(gameDefinitionObj)
        const base64String = Buffer.from(jsonString, 'utf-8').toString('base64')
        setGameDefinition(base64String)
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
            {gameDefinition && (
                <div className="game-definition">
                    <h2>Game Definition String</h2>
                    <textarea
                        value={gameDefinition}
                        readOnly
                        rows={4}
                        cols={50}
                    />
                </div>
            )}
        </div>
    )
}

export default CreatorPage
