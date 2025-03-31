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
export function shuffle(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
