import { useState } from 'react'

import Button from '@mui/material/Button'

import Tile from '@components/Tile'
import '@styles/Game.scss'

const GamePage = () => {
  const rows = 4
  const cols = 4

  // State to track selected tiles, using a unique id for each tile.
  const [selectedTiles, setSelectedTiles] = useState<string[]>([])

  // Toggle tile selection. Allow deselection and limit selection to 4.
  const handleTileClick = (id: string) => {
    setSelectedTiles((prevSelected) => {
      if (prevSelected.includes(id)) {
        // If the tile is already selected, deselect it.
        return prevSelected.filter(tileId => tileId !== id)
      } else {
        // If already 4 tiles are selected, ignore additional selections.
        if (prevSelected.length >= 4) {
          return prevSelected
        }
        return [...prevSelected, id]
      }
    })
  }

  // Create a grid of tile objects with a unique id and a placeholder word.
  const grid = Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: cols }, (_, colIndex) => ({
      id: `${rowIndex}-${colIndex}`,
      word: `R${rowIndex + 1}C${colIndex + 1}`,
    }))
  )

    return (
        <>
            <div className="game">
                {grid.map((row, rowIndex) => (
                    <div className="tile-row" key={rowIndex}>
                        {row.map(tile => (
                            <Tile
                                key={tile.id}
                                word={tile.word}
                                selected={selectedTiles.includes(tile.id)}
                                onClick={() => handleTileClick(tile.id)}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <Button
                variant="contained"
                color="primary"
                onClick={() => console.log('Selected Tiles:', selectedTiles)}
                disabled={selectedTiles.length !== 4}
            >
                Submit
            </Button>
        </>
    )
}

export default GamePage
