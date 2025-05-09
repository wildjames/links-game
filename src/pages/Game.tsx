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
    const [showVictoryDialog, setShowVictoryDialog] = useState(false)
    const [victory, setVictory] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        setVictory(rowsSolved.length === grid.length)
    }, [grid.length, rowsSolved.length])

    // Delay the victory dialog
    useEffect(() => {
        if (victory) {
            const timeoutId = setTimeout(() => {
                setShowVictoryDialog(true)
            }, 2000)

            return () => clearTimeout(timeoutId)
        }
    }, [victory])

    useEffect(() => {
        const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    useEffect(() => {
        if (!validGame) navigate(PATHS.CREATE + '?data=' + gameDefinition)
    }, [gameDefinition, navigate, validGame])

    const handleCloseVictoryDialog = () => {
        setShowVictoryDialog(false)
        navigate(PATHS.CREATE + '?data=' + gameDefinition)
    }

    return (
        <div className="game-container">
            <h1 className="game-title">Jimmylinks</h1>
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

            {victory && (
                <ReactConfetti
                    width={size.width}
                    height={size.height}
                    recycle={true}
                    numberOfPieces={1000}
                />
            )}
            <Dialog
                open={showVictoryDialog}
                disableEscapeKeyDown
                aria-labelledby="victory-dialog"
            >
                <DialogContent dividers>
                    <div className="victory-text">
                        <h2 id="victory-dialog">🎉 You did it! 🎉</h2>
                        <p>All categories have been solved.</p>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setShowVictoryDialog(false)
                        }}
                        variant="contained"
                        color="secondary"
                    >
                        Back to game
                    </Button>
                    <Button
                        onClick={handleCloseVictoryDialog}
                        variant="contained"
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
