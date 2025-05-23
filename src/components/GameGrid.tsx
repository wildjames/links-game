import { Flipper, Flipped } from "react-flip-toolkit"

import Tile from "./Tile"
import "@styles/Grid.scss"


export function ShakeSelectedTiles() {
    const tiles = document.querySelectorAll('.tile.selected')

    tiles.forEach((el) => {
        el.animate(
            [
                { transform: 'translate(0px, 0px)' },
                { transform: 'translate(-10px, 0px)' },
                { transform: 'translate(10px, 0px)' },
                { transform: 'translate(0px, 0px)' },
            ],
            {
                duration: 100,
                easing: 'linear',
                iterations: 2
            }
        )
    })
}

export interface GameGridTile {
    id: string
    word: string
}

export interface GameGridProps {
    wordGrid: GameGridTile[][]
    handleTileClick: (tile: GameGridTile) => void

    // Any selected tiles
    selectedTiles?: string[]
    // Rows that are solved. This is an array of solved category names, in order.
    solvedRows: string[]
}

const GameGrid = ({
    wordGrid: grid,
    selectedTiles = [],
    solvedRows = [],
    handleTileClick,
}: GameGridProps) => {
    const gridRowClasses = grid.map((_, index) => {
        return solvedRows[index] ? 'grid-row solved' : 'grid-row'
    })

    // We need a flattened version of the grid to use as a flipKey.
    const flatGrid = grid.flat().map(tile => tile.word).join('')

    return (
        <Flipper flipKey={flatGrid} className="grid">
            {grid.map((row, rowIndex) => (
                <div className={gridRowClasses[rowIndex]} key={rowIndex}>
                    {/* Category name, if the row is solved */}
                    {solvedRows[rowIndex] && <div className="category-name">{solvedRows[rowIndex]}</div>}
                    {/* The tiles in the row */}
                    <div className="grid-row tiles">
                        {row.map(tile =>
                            <Flipped key={tile.id} flipId={tile.id}>
                                <div>
                                    <Tile
                                        key={tile.id}
                                        word={tile.word}
                                        selected={selectedTiles.includes(tile.word)}
                                        onClick={() => handleTileClick(tile)}
                                    />
                                </div>
                            </Flipped>
                        )}
                    </div>
                </div>
            ))}
        </Flipper>
    )
}

export default GameGrid
