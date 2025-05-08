import '@styles/Tile.scss'
import { useFitText } from '../hooks/useFitText'

export interface TileProps {
    word: string
    selected: boolean
    onClick: () => void
}

const Tile = ({ word, selected, onClick }: TileProps) => {
    const isEmpty = word.length === 0
    const { ref: textRef, fontSize } = useFitText<HTMLParagraphElement>({
        minPx: 8,
        maxPx: 24,
    })

    return (
        <div
            className={`tile${selected ? ' selected' : ''}${isEmpty ? ' empty' : ''}`}
            onClick={onClick}
        >
            <p
                className='tile-text'
                ref={textRef}
                style={{ fontSize: `${fontSize}px` }}
            >
                {isEmpty ? <span className='placeholder'>Enter word</span> : word}
            </p>
        </div>
    )
}

export default Tile
