import Tile from "./Tile"
import "@styles/Grid.scss"

import { GridTile } from "@utils/commonTypes"


export interface CreatorGridProps {
    wordGrid: GridTile[][]
    handleTileClick: (tile: GridTile) => void

    // id of the tile currently being edited.
    editingTileId?: string
    onTileTextChange: (tileId: string, newText: string) => void
}

const CreatorGrid = ({
    wordGrid: grid,
    handleTileClick,
    editingTileId,
    onTileTextChange
}: CreatorGridProps) => {
    const gridRowClass = 'grid-row solved'

    return (
        <div className="grid">
            {grid.map((row, rowIndex) => (
                <div className={gridRowClass} key={rowIndex}>
                    {row.map(tile =>
                        editingTileId === tile.id && onTileTextChange ? (
                            // Editing mode, the tile is an input box
                            <div>
                                <input
                                    className="tile"
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
            ))}
        </div>
    )
}

export default CreatorGrid
