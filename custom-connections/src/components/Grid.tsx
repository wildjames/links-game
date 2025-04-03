import { Flipper, Flipped } from "react-flip-toolkit"

import Tile from "./Tile"
import "@styles/Grid.scss"

export interface GridTile {
    id: string
    word: string
}

export interface GridProps {
    grid: GridTile[][]
    handleTileClick: (tile: GridTile) => void

    // Optional: for game play selection (used by Game)
    selectedTiles?: string[]

    // For editable mode: the id of the tile currently being edited.
    editingTileId?: string
    // For editable mode: callback when tile text changes.
    onTileTextChange?: (tileId: string, newText: string) => void
}

const Grid = ({
    grid,
    selectedTiles = [],
    handleTileClick,
    editingTileId,
    onTileTextChange,
}: GridProps) => {
    // If we're in editable mode, then we are showing a solved grid. Make all the rows the right class
    const editable = !!onTileTextChange
    const gridRowClass = editable ? 'grid-row solved' : 'grid-row'

    const flatGrid = grid.flat().map(tile => tile.word).join('')
    console.log("Grid render", grid)

    return (
        <Flipper flipKey={flatGrid} className="grid">
            {grid.map((row, rowIndex) => (
                <div className={gridRowClass} key={rowIndex}>
                    {row.map(tile =>
                        editingTileId === tile.id && onTileTextChange ? (
                            // Editing mode, the tile is an input box
                            <Flipped key={tile.word} flipId={tile.word}>
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
                                                e.preventDefault();
                                                e.currentTarget.blur();
                                            }
                                        }}
                                    />
                                </div>
                            </Flipped>
                        ) : (
                            // Normal mode, the tile is static content
                            <Flipped key={tile.word} flipId={tile.word}>
                                <div>
                                    <Tile
                                        key={tile.id}
                                        word={tile.word}
                                        selected={selectedTiles.includes(tile.word)}
                                        onClick={() => handleTileClick(tile)}
                                    />
                                </div>
                            </Flipped>
                        )
                    )}
                </div>
            ))}
        </Flipper>
    )
}

export default Grid
