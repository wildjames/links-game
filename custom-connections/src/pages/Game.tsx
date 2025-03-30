import { useState, useEffect } from 'react'
import Button from '@mui/material/Button'

import Tile from '@components/Tile'
import '@styles/Game.scss'

const Game = () => {
  const rows = 4
  const cols = 4

  const [words, setWords] = useState<string[]>([])

  // On mount, parse the query string to update words.
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const wordsParam = searchParams.get('words')
    if (wordsParam) {
      // Assume words are provided as comma-separated values.
      const parsedWords = wordsParam.split(',').map(word => decodeURIComponent(word.trim()))
      setWords(parsedWords)
    }
  }, [])

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

  // Create a grid of tile objects.
  // Each tile's word is taken from the words array based on its index,
  // or left blank if the array does not provide enough words.
  const grid = Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: cols }, (_, colIndex) => {
      const index = rowIndex * cols + colIndex
      return {
        id: `${rowIndex}-${colIndex}`,
        word: words[index] || '',
      }
    })
  )

  // When there are too many words, render an error string.
  if (words.length > rows * cols) {
    return <div>Error: too many words!</div>
  }

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

export default Game
