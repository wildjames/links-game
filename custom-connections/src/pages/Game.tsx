import { useState, useEffect } from 'react'
import { Buffer } from 'buffer'

import Button from '@mui/material/Button'

import { GridTile } from '@components/Grid'
import Grid from '@components/Grid'

import '@styles/Game.scss'

import { checkGameDefinition, shuffle, validateWord } from '@utils/utils'

export interface WordCategory {
    wordArray: string[]
    categoryName: string
}

export interface GameState {
    words: string[]
    categories: WordCategory[]
    rows: number
    columns: number
    categorySize: number
}

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

    const [validGame, setValidGame] = useState(false)


    // On mount, parse the query string to update the game definition.
    useEffect(() => {
        setValidGame(false)
        const searchParams = new URLSearchParams(window.location.search)

        const payload = searchParams.get('data')
        if (!payload) {
            console.error('No data found in the URL')
            return
        }

        const data = Buffer.from(payload, "base64").toString('utf-8')
        const parsedData: GameState = JSON.parse(data)
        console.debug('Parsed data:', parsedData)

        // This will throw an error if the game definition is invalid.
        checkGameDefinition(parsedData)

        const parsedWords = parsedData.words
            .map(word => decodeURIComponent(word.trim()))
            .filter(word => validateWord(word))
        shuffle(parsedWords)

        // Set the states once we know all is well
        setWords(parsedWords)
        setCategories(parsedData.categories)

        setRows(parsedData.rows)
        setCols(parsedData.columns)
        setMaxSelections(parsedData.categorySize)

        setValidGame(true)
    }, [window.location.search])

    // Toggle tile selection. Allow deselection and limit selection
    const handleTileClick = (tile: GridTile) => {
        const { id } = tile

        setSelectedTiles((prevSelected) => {
            if (prevSelected.includes(id)) {
                // If the tile is already selected, deselect it.
                return prevSelected.filter(tileId => tileId !== id)
            } else {
                // If already 4 tiles are selected, ignore additional selections.
                if (prevSelected.length >= maxSelections) {
                    return prevSelected
                }
                return [...prevSelected, id]
            }
        })
    }

    const handleSubmit = () => {
        console.debug('Selected tiles:', selectedTiles)
        // Find a category where all selected words exist.
        const matchingCategory = categories.find(category =>
            selectedTiles.every(word => category.wordArray.includes(word))
        );

        if (matchingCategory) {
            console.debug(`Correct! category: ${matchingCategory.categoryName}`)

            // TODO: Handle correct submission
            setSelectedTiles([]) // Reset selected tiles after submission
        } else {
            console.debug('Incorrect.');

            // TODO: Handle incorrect submission. Some kind of animation for feedback
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
                    word: words[index] || '',
                }
            })
        )

        setGrid(newGrid)
    }, [words, rows, cols])

    // When there are too many words, render an error string.
    if (!validGame) {
        return <div>Error: bad game configuration!</div>
    }

    return (
        <>
            <Grid
                grid={grid}
                selectedTiles={selectedTiles}
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
        </>
    )
}

export default Game
