export interface WordCategory {
    wordArray: string[]
    categoryName: string
}

export interface GameState {
    categories: WordCategory[]
    rows: number
    columns: number
    categorySize: number
}
