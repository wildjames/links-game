import { WordCategory, GameState } from '@utils/commonTypes'

// TODO: Profanity checking? Stuff like that?
export const validateWord = (word: string): boolean => {
    return !!word && word.length > 0;
}

/**
 * Checks if all words in the category exist in the complete words array.
 *
 * @param categoryWordArray - Array of words belonging to a category.
 * @param words - Complete array of words.
 * @returns true if every word in categoryWordArray exists in words, false otherwise.
 */
export function checkCategoryContainsWords(categoryWordArray: string[], words: string[]): boolean {
    return categoryWordArray.every(word => words.includes(word));
}


/**
 * Shuffles an array in place using the Durstenfeld shuffle.
 *
 * @param array - The array to shuffle.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function shuffle(array: Array<any>): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}


/**
 * Checks if the given game definition is valid.
 * Throws an error if any of the checks fail.
 */
export function checkGameDefinition(gameDefinition: GameState): void {
    // Check all words are unique
    // get a big list of all the words
    const parsedWords = gameDefinition.categories
        .flatMap(category => category.wordArray)
        .map(word => word.trim().toLowerCase())
        .filter((word: string) => validateWord(word)) // remove empty words

    const uniqueWords = new Set(parsedWords)
    if (uniqueWords.size !== parsedWords.length) {
        console.error("Duplicate words found in the list", parsedWords)
        throw new Error("Duplicate words found in the list")
    }

    // Check all the words are valid
    parsedWords
        .map(word => validateWord(word))
        .forEach((isValid: boolean, index: number) => {
            if (!isValid) {
                throw new Error(`Invalid word found: ${parsedWords[index]}`)
            }
        })

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
        gameDefinition.categories.length !== gameDefinition.columns
        && gameDefinition.categories.length !== gameDefinition.rows) {
        console.error(
            "The number of categories provided does not match the number of rows or columns",
            gameDefinition.categories.length, gameDefinition.rows, gameDefinition.columns, gameDefinition.categorySize
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
