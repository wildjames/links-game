import '@styles/Tile.scss'

export interface TileProps {
    word: string
    selected: boolean
    onClick: () => void
}

const Tile = ({ word, selected, onClick }: TileProps) => {
    const isEmpty = word.length === 0

    return (
        <div
            className={`tile${selected ? ' selected' : ''}${isEmpty ? ' empty' : ''}`}
            onClick={onClick}
        >
            <p className='tile-text'>
                {isEmpty ? <span className='placeholder'>Enter word</span> : word}
            </p>
        </div>
    )
}

export default Tile
