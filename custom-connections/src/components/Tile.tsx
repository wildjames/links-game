import { useState } from 'react'
import '@styles/Tile.scss'

export interface TileProps {
    word: String,
}

const Tile = ({ word }: TileProps) => {
  const [selected, setSelected] = useState(false)

  const handleClick = () => {
    setSelected(!selected)
  }

  return (
    <div
      className={`tile ${selected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      {word}
    </div>
  )
}

export default Tile
