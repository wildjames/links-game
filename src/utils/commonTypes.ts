export interface WordCategory {
    wordArray: string[]
    categoryName: string
}

export interface GameState {
    categories: WordCategory[]
    rows: number
    categorySize: number
}


export interface GridTile {
    id: string
    word: string
}
