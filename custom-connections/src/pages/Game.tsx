import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Buffer } from 'buffer'

import Button from '@mui/material/Button'

import { GridTile } from '@components/Grid'
import Grid from '@components/Grid'

import '@styles/Game.scss'

import { checkGameDefinition, shuffle, validateWord } from '@utils/utils'
import { WordCategory, GameState } from '@utils/commonTypes'

const Game = () => {
    const [rows, setRows] = useState(4)
    const [cols, setCols] = useState(4)
    const [maxSelections, setMaxSelections] = useState(4)

    const [words, setWords] = useState<string[]>([])
    const [categories, setCategories] = useState<WordCategory[]>([])

    // The grid is a 2D array of objects, each with an id and a word.
    const [grid, setGrid] = useState<GridTile[][]>([])

    // track selected tiles, using a unique id for each tile.
    const [selectedTiles, setSelectedTiles] = useState<string[]>([])
    const [rowsSolved, setRowsSolved] = useState<boolean[]>([])
    const [validGame, setValidGame] = useState(false)

    const [searchParams] = useSearchParams()


    // On mount, parse the query string to update the game definition.
    useEffect(() => {

        const payload = searchParams.get('data')
        if (!payload) {
            console.error('No data found in the URL')
            setValidGame(false)
            return
        }

        try {
            const data = Buffer.from(payload, "base64").toString('utf-8')
            const parsedData: GameState = JSON.parse(data)
            console.debug('Parsed data:', parsedData)

            // This will throw an error if the game definition is invalid.
            checkGameDefinition(parsedData)

            const parsedWords = parsedData.categories
                .flatMap(category => category.wordArray)
                .map(word => word.trim())
                .filter(word => validateWord(word))
            shuffle(parsedWords)

            // Set the states once we know all is well
            setWords(parsedWords)
            setRowsSolved(new Array(parsedData.rows).fill(false))
            setCategories(parsedData.categories)

            setRows(parsedData.rows)
            setCols(parsedData.columns)
            setMaxSelections(parsedData.categorySize)

            setValidGame(true)
        } catch (error) {
            console.error('Error parsing game definition:', error)
            setValidGame(false)
        }
    }, [searchParams])

    // Toggle tile selection. Allow deselection and limit selection
    const handleTileClick = (tile: GridTile) => {
        // If the tile is already part of a solved row, ignore it.
        const tileIndex = grid.flat().findIndex(t => t.id === tile.id)
        const rowIndex = Math.floor(tileIndex / cols)
        if (rowsSolved[rowIndex]) {
            console.debug("Tile already solved, ignoring click.")
            return
        }

        setSelectedTiles((prevSelected) => {
            if (prevSelected.includes(tile.word)) {
                // If the tile is already selected, deselect it.
                console.debug("Tile deselected:", tile.word)
                return prevSelected.filter(tileWord => tileWord !== tile.word)
            } else {
                // If already 4 tiles are selected, ignore additional selections.
                if (prevSelected.length >= maxSelections) {
                    console.debug("Max selections reached, ignoring additional selections.")
                    return prevSelected
                }
                console.debug("Tile selected:", tile.word)
                return [...prevSelected, tile.word]
            }
        })
    }

    const handleSubmit = () => {
        console.debug('Selected tiles:', selectedTiles)

        const matchingCategory = categories.find(category =>
            selectedTiles.every(word => category.wordArray.includes(word))
        )

        if (matchingCategory) {
            console.debug(`Correct! category: ${matchingCategory.categoryName}`)

            const numAlreadySolved = rowsSolved.reduce(
                (accumulator, currentValue) => accumulator + (currentValue ? 1 : 0),
                0
            )

            setGrid(prevGrid => {
                const flatGrid = prevGrid.flat()

                // Separate selected and remaining tiles
                const selected = flatGrid.filter(tile => selectedTiles.includes(tile.word))
                const remaining = flatGrid.filter(tile => !selectedTiles.includes(tile.word))

                // Insert selected group at the index corresponding to the next unsolved row
                const insertIndex = numAlreadySolved * cols
                const reordered = [
                    ...remaining.slice(0, insertIndex),
                    ...selected,
                    ...remaining.slice(insertIndex),
                ].slice(0, rows * cols) // just to be sage, slice to the grid size

                // Rebuild the 2D grid from reordered list
                const newGrid: GridTile[][] = []
                for (let row = 0; row < rows; row++) {
                    const rowTiles = []
                    for (let col = 0; col < cols; col++) {
                        const index = row * cols + col
                        const tile = reordered[index]
                        if (tile) {
                            rowTiles.push(tile)
                        }
                    }
                    newGrid.push(rowTiles)
                }

                return newGrid
            })

            setRowsSolved(prevRowsSolved => {
                const newRowsSolved = [...prevRowsSolved]
                newRowsSolved[numAlreadySolved] = true // Mark the next row as solved
                return newRowsSolved
            })

            setSelectedTiles([])
        } else {
            console.debug('Incorrect.')

            // TODO: Add visual feedback?
            setSelectedTiles([])
        }
    }

    useEffect(() => {
        // Only update if we have everything we need.
        if (!rows || !cols || !words.length) {
            return
        }

        // Create a grid of tile objects.
        const newGrid = Array.from({ length: rows }, (_, rowIndex) =>
            Array.from({ length: cols }, (_, colIndex) => {
                const index = rowIndex * cols + colIndex
                return {
                    id: `${rowIndex}-${colIndex}`,
                    word: words[index] || `${rowIndex}-${colIndex}`,
                }
            })
        )

        setGrid(newGrid)
    }, [words, rows, cols])

    if (!validGame) {
        return <div>Error: bad game configuration!</div>
    }

    return (
        <>

            <div className="game-container">
                <h1>links</h1>
                <Grid
                    grid={grid}
                    selectedTiles={selectedTiles}
                    solvedRows={rowsSolved}
                    handleTileClick={handleTileClick}
                />

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    className="submit-button"
                    disabled={selectedTiles.length !== 4}
                >
                    Submit
                </Button>
            </div>
        </>
    )
}

export default Game
