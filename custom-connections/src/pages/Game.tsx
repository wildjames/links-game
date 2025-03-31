import { useState, useEffect } from 'react'
import Button from '@mui/material/Button'

import Tile from '@components/Tile'
import '@styles/Game.scss'

import { checkCategoryContainsWords, shuffle, validateWord } from '@utils/utils'

interface WordCategory {
    wordArray: string[]
    categoryName: string
}

const Game = () => {
    const rows = 4
    const cols = 4
    const maxSelections = 4

    // track selected tiles, using a unique id for each tile.
    const [selectedTiles, setSelectedTiles] = useState<string[]>([])
    // track words, initialized as an empty array.
    const [words, setWords] = useState<string[]>([])
    // track work categories
    const [categories, setCategories] = useState<WordCategory[]>([])

    // On mount, parse the query string to update words.
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search)
        const wordsParam = searchParams.get('words')
        let parsedWords: string[] = []
        if (wordsParam) {
            // words are provided as comma-separated values.
            parsedWords = wordsParam
                .split(',')
                .map(word => decodeURIComponent(word.trim()))
                .filter(word => validateWord(word))

            // TODO: Check all words are unique

            shuffle(parsedWords)
            setWords(parsedWords)
        }

        const categoriesParam = searchParams.get('categories')
        if (categoriesParam) {
            // categories are provided as URL encoded JSON string.
            const parsedCategories = JSON.parse(decodeURIComponent(categoriesParam))
            const validCategories = parsedCategories
                .filter((category: WordCategory) => {
                    return category.wordArray.every((word: string) => validateWord(word))
                })
                .filter((category: WordCategory) => checkCategoryContainsWords(category.wordArray, parsedWords))
            // TODO: Ensure each category has a unique name, and that categories have no overlapping words.
            // TODO: Check we have the right number of categories.

            setCategories(validCategories)
        }
    }, [])

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
        console.log('Selected tiles:', selectedTiles)
        // Find a category where all selected words exist.
        const matchingCategory = categories.find(category =>
            selectedTiles.every(word => category.wordArray.includes(word))
        );

        if (matchingCategory) {
            console.log(`Correct! category: ${matchingCategory.categoryName}`);
        } else {
            console.log('Incorrect.');
        }
    }

    // Create a grid of tile objects.
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
    if (words.length !== rows * cols) {
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
