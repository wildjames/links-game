import '@styles/Tile.scss'

export interface TileProps {
    word: string
    selected: boolean
    onClick: () => void
}

const Tile = ({ word, selected, onClick }: TileProps) => {
    return (
        <div
            className={`tile ${selected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <p className='tile-text'>{word}</p>
        </div>
    )
}

export default Tile
