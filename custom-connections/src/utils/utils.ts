import { GameState, WordCategory } from "@pages/Game";

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
    const uniqueWords = new Set(gameDefinition.words)
    if (uniqueWords.size !== gameDefinition.words.length) {
        throw new Error("Duplicate words found in the list")
    }

    // categories are provided as URL encoded JSON string.
    const validCategories = gameDefinition.categories
        .filter((category: WordCategory) => {
            return category.wordArray.every((word: string) => validateWord(word))
        })
        .filter((category: WordCategory) => checkCategoryContainsWords(category.wordArray, gameDefinition.words))

    // each category has a unique name
    const uniqueCategoryNames = new Set(validCategories.map((category: WordCategory) => category.categoryName))
    if (uniqueCategoryNames.size !== validCategories.length) {
        throw new Error("Duplicate category names found")
    }

    // all words in the categories are unique (i.e. no overlaps)
    const allCategoryWords = validCategories.flatMap((category: WordCategory) => category.wordArray)
    const uniqueCategoryWords = new Set(allCategoryWords)
    if (uniqueCategoryWords.size !== allCategoryWords.length) {
        throw new Error("Duplicate words found across the categories")
    }

    // we have the right number of categories.
    if (validCategories.length !== gameDefinition.columns && validCategories.length !== gameDefinition.rows) {
        throw new Error("The wrong number of categories were provided")
    }

    // the number of words in each category is correct.
    if (validCategories.some((category: WordCategory) => category.wordArray.length !== gameDefinition.categorySize)) {
        throw new Error("The wrong number of words were provided in a category")
    }

}
