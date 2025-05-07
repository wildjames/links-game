import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Dialog, DialogActions, DialogContent } from '@mui/material'
import ReactConfetti from 'react-confetti'

import GameGrid from '@components/GameGrid'
import { useGame } from '@hooks/useGame'
import '@styles/Game.scss'
import { PATHS } from '@constants/environment'

const Game = () => {
    const {
        maxSelections,
        grid,
        selectedTiles,
        oneAway,
        rowsSolved,
        validGame,
        gameDefinition,
        handleTileClick,
        handleSubmit,
        handleCloseOneAway,
    } = useGame()

    // track window size so confetti fills the screen
    const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })

    const navigate = useNavigate()

    useEffect(() => {
        const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    const victory = rowsSolved.every(row => row);

    if (!validGame) {
        return <div>Error: bad game configuration!</div>
    }

    return (
        <div className="game-container">
            <h1>Links</h1>
            <GameGrid
                wordGrid={grid}
                selectedTiles={selectedTiles}
                solvedRows={rowsSolved}
                handleTileClick={handleTileClick}
            />

            <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                className="submit-button"
                disabled={selectedTiles.length !== maxSelections}
            >
                Submit
            </Button>

            <Dialog
                open={oneAway}
                onClose={handleCloseOneAway}
                aria-labelledby="one-away-dialog"
                className="one-away-dialog"
            >
                <DialogContent dividers>
                    <div className="one-away-text">
                        <h2 id="one-away-dialog">One away…</h2>
                    </div>
                </DialogContent>
            </Dialog>

            {/* confetti should render behind the dialog walls */}
            {victory && (
                <ReactConfetti
                    width={size.width}
                    height={size.height}
                    recycle={true}
                    numberOfPieces={1000}
                />
            )}
            <Dialog
                open={victory}
                disableEscapeKeyDown
                aria-labelledby="victory-dialog"
            >
                <DialogContent dividers>
                    <div style={{ textAlign: 'center', padding: '2rem 3rem' }}>
                        <h2 id="victory-dialog">🎉 You did it! 🎉</h2>
                        <p>All categories have been solved.</p>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => navigate(PATHS.CREATE + '?data=' + gameDefinition)}
                        color="primary"
                    >
                        Make your own game?
                    </Button>
                </DialogActions>
            </Dialog >

        </div >
    )
}

export default Game
