import Tile from "./Tile"

export interface GridTile {
    id: string
    word: string
}

export interface GridProps {
    grid: GridTile[][]
    selectedTiles: string[]
    handleTileClick: (tile: GridTile) => void
}

const Grid = ({ grid, selectedTiles, handleTileClick }: GridProps) => {

    return (
        <div className="game">
            {grid.map((row, rowIndex) => (
                <div className="tile-row" key={rowIndex}>
                    {row.map(tile => (
                        <Tile
                            key={tile.id}
                            word={tile.word}
                            selected={selectedTiles.includes(tile.word)}
                            onClick={() => handleTileClick(tile)}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

export default Grid
