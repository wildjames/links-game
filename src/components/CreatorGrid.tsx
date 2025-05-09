import { TextField } from "@mui/material"
import Tile from "./Tile"
import "@styles/Grid.scss"

import { GridTile } from "@utils/commonTypes"


export interface CreatorGridProps {
    wordGrid: GridTile[][]
    handleTileClick: (tile: GridTile) => void

    // id of the tile currently being edited.
    editingTileId?: string
    onTileTextChange: (tileId: string, newText: string) => void

    categoryNames: string[]
    setCategoryNames: (categoryNames: string[]) => void
}

const CreatorGrid = ({
    wordGrid: grid,
    handleTileClick,
    editingTileId,
    onTileTextChange,
    categoryNames,
    setCategoryNames
}: CreatorGridProps) => {
    const gridRowClass = 'grid-row solved'

    const handleUpdateCategoryName = (rowIndex: number, newName: string) => {
        const newCategoryNames = [...categoryNames]
        newCategoryNames[rowIndex] = newName
        setCategoryNames(newCategoryNames)
    }

    return (
        <div className="grid">
            {grid.map((row, rowIndex) => (
                <div className={gridRowClass} key={rowIndex}>
                    {/* Category name */}
                    <TextField
                        value={categoryNames[rowIndex]}
                        onChange={(e => handleUpdateCategoryName(rowIndex, e.target.value))}
                        type="text"
                        placeholder="Category name"
                        size="small"
                        sx={{
                            marginBottom: '0.5rem',
                            marginTop: '0.5rem',
                        }}
                    />

                    <div className="grid-row tiles">
                        {row.map(tile =>
                            editingTileId === tile.id && onTileTextChange ? (
                                // Editing mode, the tile is an input box
                                <div>
                                    {/* Dont use the MUI element here, since I'm doing some nonstandard styling */}
                                    <input
                                        className="tile editing"
                                        key={tile.id}
                                        data-testid={tile.id}
                                        type="text"
                                        value={tile.word}
                                        onChange={(e) => onTileTextChange(tile.id, e.target.value)}
                                        placeholder="Enter word"
                                        onBlur={() => handleTileClick(tile)}
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                e.currentTarget.blur()
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                // Normal mode, the tile is static content
                                <div>
                                    <Tile
                                        key={tile.id}
                                        word={tile.word}
                                        selected={false}
                                        onClick={() => handleTileClick(tile)}
                                    />
                                </div>
                            )
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default CreatorGrid
