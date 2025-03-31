import Tile from "./Tile"

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
    return (
        <div className="game">
            {grid.map((row, rowIndex) => (
                <div className="tile-row" key={rowIndex}>
                    {row.map(tile =>
                        editingTileId === tile.id && onTileTextChange ? (
                            <input
                                className="tile"
                                key={tile.id}
                                type="text"
                                value={tile.word}
                                onChange={(e) => onTileTextChange(tile.id, e.target.value)}
                                onBlur={() => handleTileClick(tile)}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.currentTarget.blur();
                                    }
                                }}
                            />
                        ) : (
                            <Tile
                                key={tile.id}
                                word={tile.word}
                                selected={selectedTiles.includes(tile.word)}
                                onClick={() => handleTileClick(tile)}
                            />
                        )
                    )}
                </div>
            ))}
        </div>
    )
}

export default Grid
