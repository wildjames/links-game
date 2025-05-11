import { BACKEND_PATHS } from '@constants/environment'
import { WordCategory, GameState } from '@utils/commonTypes'

// TODO: Profanity checking? Stuff like that?
export const validateWord = (word: string): boolean => {
    return !!word && word.length > 0
}

/**
 * Checks if all words in the category exist in the complete words array.
 *
 * @param categoryWordArray - Array of words belonging to a category.
 * @param words - Complete array of words.
 * @returns true if every word in categoryWordArray exists in words, false otherwise.
 */
export function checkCategoryContainsWords(categoryWordArray: string[], words: string[]): boolean {
    return categoryWordArray.every(word => words.includes(word))
}


/**
 * Shuffles an array in place using the Durstenfeld shuffle.
 *
 * @param array - The array to shuffle.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function shuffle(array: Array<any>): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}


/**
 * Checks if the given game definition is valid.
 * Throws an error if any of the checks fail.
 */
export function checkGameDefinition(gameDefinition: GameState): void {
    console.log("Checking game definition", gameDefinition)

    // Check all words are unique
    // get a big list of all the words
    const parsedWords = gameDefinition.categories
        .flatMap(category => category.wordArray)
        .map(word => word.trim().toLowerCase())

    // If any words are empty, throw an error
    if (parsedWords.some(word => word.length === 0)) {
        throw new Error("Empty words are not allowed")
    }

    // Check all the words are valid
    parsedWords
        .map(word => validateWord(word))
        .forEach((isValid: boolean, index: number) => {
            if (!isValid) {
                throw new Error(`Invalid word found: "${parsedWords[index]}"`)
            }
        })

    const uniqueWords = new Set(parsedWords)
    if (uniqueWords.size !== parsedWords.length) {
        const duplicatedWords = parsedWords.filter((word: string, index: number) => {
            return parsedWords.indexOf(word) !== index
        })
        console.error("Duplicate words found in the list", duplicatedWords)
        throw new Error("Duplicate words found in the list")
    }

    // each category has a unique name
    const uniqueCategoryNames = new Set(gameDefinition.categories.map((category: WordCategory) => category.categoryName))
    if (uniqueCategoryNames.size !== gameDefinition.categories.length) {
        throw new Error("Duplicate category names found")
    }

    // all words in the categories are unique (i.e. no overlaps)
    const allCategoryWords = gameDefinition.categories.flatMap((category: WordCategory) => category.wordArray)
    const uniqueCategoryWords = new Set(allCategoryWords)
    if (uniqueCategoryWords.size !== allCategoryWords.length) {
        throw new Error("Duplicate words found across the categories")
    }

    // we have the right number of categories.
    if (
        gameDefinition.categories.length !== gameDefinition.categorySize
        && gameDefinition.categories.length !== gameDefinition.rows) {
        console.error(
            "The number of categories provided does not match the number of rows or columns",
            gameDefinition.categories.length, gameDefinition.rows, gameDefinition.categorySize
        )
        throw new Error("The wrong number of categories were provided")
    }

    // the number of words in each category is correct.
    if (
        gameDefinition.categories
            .some((category: WordCategory) => category.wordArray.length !== gameDefinition.categorySize)
    ) {
        throw new Error("The wrong number of words were provided in a category")
    }
}


export function checkIfValidUUIDv4(uuid: string): boolean {
    const uuidv4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
    return uuidv4Regex.test(uuid.toUpperCase())
}

export async function storeGameState(
    categories: WordCategory[],
    rows: number,
    categorySize: number,
): Promise<string> {
    const stateObj: GameState = {
        categories,
        rows,
        categorySize,
    }

    const response = await fetch(BACKEND_PATHS.CREATE, {
        method: 'POST',
        body: JSON.stringify(stateObj),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    })
    if (!response.ok) {
        console.error('Failed to store game state:', response.statusText)
        throw new Error('Failed to store game state')
    }
    const data = await response.json()
    console.log('Stored game state:', data)
    return data.id
}

interface FetchGameStateResponse {
    game_encoding: string
}

export async function fetchGameState(gameId: string): Promise<FetchGameStateResponse> {
    const response = await fetch(BACKEND_PATHS.FETCH.replace(':gameId', gameId), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    })
    if (!response.ok) {
        console.error('Failed to fetch game state:', response.statusText)
        throw new Error('Failed to fetch game state')
    }

    const data: FetchGameStateResponse = await response.json()
    console.log('Fetched game state:', data)
    return data
}
