import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Buffer } from 'buffer'

import { GameGridTile, ShakeSelectedTiles } from '@components/GameGrid'

import {
    checkGameDefinition,
    checkIfValidUUIDv4,
    fetchGameState,
    shuffle,
    validateWord
} from '@utils/utils'
import { WordCategory, GameState } from '@utils/commonTypes'


export const useGame = () => {
    const [rows, setRows] = useState(4)
    const [cols, setCols] = useState(4)
    const [maxSelections, setMaxSelections] = useState(4)

    const [words, setWords] = useState<string[]>([])
    const [categories, setCategories] = useState<WordCategory[]>([])

    const [grid, setGrid] = useState<GameGridTile[][]>([])
    const [selectedTiles, setSelectedTiles] = useState<string[]>([])
    const [rowsSolved, setRowsSolved] = useState<string[]>([])
    const [oneAway, setOneAway] = useState(false)
    const [validGame, setValidGame] = useState(true)

    const [searchParams] = useSearchParams()
    const [gameDefinition, setGameDefinition] = useState<string | null>(null)

    // On mount, parse the query string to update the game definition.
    useEffect(() => {
        async function fetchData() {
            const payload = searchParams.get('data')
            if (!payload) {
                console.error('No data found in the URL')
                setValidGame(false)
                return
            }

            // If the payload is a valid UUID, fetch the game state from the backend.
            let parsedData: GameState | undefined = undefined
            if (payload.length === 36) {
                if (checkIfValidUUIDv4(payload)) {
                    try {
                        const data = await fetchGameState(payload)
                        if (!data) {
                            console.error('Failed to fetch game state')
                            return
                        }
                        const text = Buffer.from(data.game_encoding, 'base64').toString('utf8')
                        if (!text) {
                            console.error('Invalid response from the server', data)
                            return
                        }
                        parsedData = JSON.parse(text)
                    } catch (err) {
                        console.error('Failed to fetch game state:', err)
                        return
                    }
                } else {
                    // It's not possible to have a base64 encoding this short, so we don't need to check
                    console.error('Invalid game ID:', payload)
                    return
                }
            } else {
                // If the data is not a UUID, we assume it's a base64 encoded game state
                const text = Buffer.from(payload, 'base64').toString('utf8')
                parsedData = JSON.parse(text)
                if (!parsedData) {
                    console.error('Failed to parse game state from URL')
                    return
                }
            }

            if (!parsedData) {
                console.error('No game state found in the URL')
                setValidGame(false)
                return
            }

            setGameDefinition(payload)

            try {
                console.debug('Parsed data:', parsedData)

                checkGameDefinition(parsedData) // Validates the game data

                const parsedWords = parsedData.categories
                    .flatMap(category => category.wordArray)
                    .map(word => word.trim())
                    .filter(word => validateWord(word))
                shuffle(parsedWords)

                setWords(parsedWords)
                setRowsSolved([])
                setCategories(parsedData.categories)

                setRows(parsedData.rows)
                setCols(parsedData.categorySize)
                setMaxSelections(parsedData.categorySize)

                setValidGame(true)
            } catch (error) {
                console.error('Error parsing game definition:', error)
                setValidGame(false)
            }
        }

        fetchData()
    }, [searchParams])

    useEffect(() => {
        if (!rows || !cols || !words.length) return

        // Create a grid of tile objects.
        const newGrid = Array.from({ length: rows }, (_, rowIndex) =>
            Array.from({ length: cols }, (_, colIndex) => {
                const index = rowIndex * cols + colIndex
                return {
                    id: `${rowIndex}-${colIndex}`,
                    word: words[index],
                }
            })
        )
        setGrid(newGrid)
    }, [words, rows, cols])

    const handleTileClick = (tile: GameGridTile) => {
        const tileIndex = grid.flat().findIndex(t => t.id === tile.id)
        const rowIndex = Math.floor(tileIndex / cols)
        if (rowsSolved[rowIndex]) return

        setSelectedTiles(prevSelected => {
            if (prevSelected.includes(tile.word)) {
                return prevSelected.filter(tileWord => tileWord !== tile.word)
            } else {
                if (prevSelected.length >= maxSelections) return prevSelected
                return [...prevSelected, tile.word]
            }
        })
    }

    // Close the one away dialog after a short delay
    useEffect(() => {
        if (oneAway) {
            const timer = setTimeout(() => {
                setOneAway(false)
            }, 10000)

            return () => clearTimeout(timer)
        }
    }, [oneAway])

    const handleSubmit = () => {
        const matchingCategory = categories.find(category =>
            selectedTiles.every(word => category.wordArray.includes(word))
        )

        if (matchingCategory) {
            const numAlreadySolved = rowsSolved.reduce(
                (acc, current) => acc + (current ? 1 : 0),
                0
            )

            setGrid(prevGrid => {
                const flatGrid = prevGrid.flat()
                const selected = flatGrid.filter(tile => selectedTiles.includes(tile.word))
                const remaining = flatGrid.filter(tile => !selectedTiles.includes(tile.word))

                const insertIndex = numAlreadySolved * cols
                const reordered = [
                    ...remaining.slice(0, insertIndex),
                    ...selected,
                    ...remaining.slice(insertIndex),
                ].slice(0, rows * cols)

                const newGrid: GameGridTile[][] = []
                for (let row = 0; row < rows; row++) {
                    const rowTiles = []
                    for (let col = 0; col < cols; col++) {
                        const index = row * cols + col
                        rowTiles.push(reordered[index])
                    }
                    newGrid.push(rowTiles)
                }

                return newGrid
            })

            setRowsSolved(prevRowsSolved => {
                const newRowsSolved = [...prevRowsSolved]
                newRowsSolved[numAlreadySolved] = matchingCategory.categoryName
                return newRowsSolved
            })

            setSelectedTiles([])
        } else {
            // Not a match

            // Check if the user is one away from a match
            const almost = categories.find(cat => {
                const correctCount = selectedTiles.filter(word =>
                    cat.wordArray.includes(word)
                ).length
                return correctCount === maxSelections - 1
            })

            if (almost) {
                setOneAway(true)
            }

            ShakeSelectedTiles()
        }
    }

    const handleCloseOneAway = useCallback(() => {
        setOneAway(false)
    }, [])

    return {
        rows,
        cols,
        maxSelections,
        grid,
        selectedTiles,
        oneAway,
        rowsSolved,
        validGame,
        gameDefinition,
        handleTileClick,
        handleSubmit,
        handleCloseOneAway,
    }
}
