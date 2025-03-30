import Tile from '@components/Tile'
import '@styles/Game.scss'

const GamePage = () => {
  const rows = 5
  const cols = 5

  const grid = Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: cols }, (_, colIndex) => `R${rowIndex + 1}C${colIndex + 1}`)
  )

  return (
    <div className="game">
      {grid.map((row, rowIndex) => (
        <div className="tile-row" key={rowIndex}>
          {row.map((word, colIndex) => (
            <Tile key={`${rowIndex}-${colIndex}`} word={word} />
          ))}
        </div>
      ))}
    </div>
  )
}

export default GamePage
