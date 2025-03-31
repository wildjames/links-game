import { useState, useEffect } from 'react'
import { Buffer } from 'buffer'

import Button from '@mui/material/Button'

import Tile from '@components/Tile'
import '@styles/Game.scss'

import { checkCategoryContainsWords, shuffle, validateWord } from '@utils/utils'

interface GridTile {
    id: string
    word: string
}

interface WordCategory {
    wordArray: string[]
    categoryName: string
}

interface GameState {
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

        const parsedWords = parsedData.words
            .map(word => decodeURIComponent(word.trim()))
            .filter(word => validateWord(word))

        // TODO: Check all words are unique

        shuffle(parsedWords)

        // categories are provided as URL encoded JSON string.
        const validCategories = parsedData.categories
            .filter((category: WordCategory) => {
                return category.wordArray.every((word: string) => validateWord(word))
            })
            .filter((category: WordCategory) => checkCategoryContainsWords(category.wordArray, parsedWords))

        // TODO: Ensure each category has a unique name, and that categories have no overlapping words.
        // TCheck we have the right number of categories.
        if (validCategories.length !== cols && validCategories.length !== rows) {
            console.error('The wrong number of categories were provided.')
            return
        }

        // Set the states once we know all is well
        setWords(parsedWords)
        setCategories(validCategories)

        setRows(parsedData.rows)
        setCols(parsedData.columns)
        setMaxSelections(parsedData.categorySize)

        setValidGame(true)
    }, [window.location.search])

    // Toggle tile selection. Allow deselection and limit selection
    const handleTileClick = (id: string) => {
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
            <div className="game">
                {grid.map((row, rowIndex) => (
                    <div className="tile-row" key={rowIndex}>
                        {row.map(tile => (
                            <Tile
                                key={tile.id}
                                word={tile.word}
                                selected={selectedTiles.includes(tile.word)}
                                onClick={() => handleTileClick(tile.word)}
                            />
                        ))}
                    </div>
                ))}
            </div>

            <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                className="submit-button"
                disabled={selectedTiles.length !== 4}
            >
                Submit
            </Button>

            <div className="categories">
                {categories.map((category, index) => (
                    <div key={index} className="category">
                        <h3>{category.categoryName}</h3>
                        <ul>
                            {category.wordArray.map((word, wordIndex) => (
                                <li key={wordIndex}>{word}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </>
    )
}

export default Game
