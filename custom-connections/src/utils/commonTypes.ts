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
