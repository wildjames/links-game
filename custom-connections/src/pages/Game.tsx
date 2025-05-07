import { Button, Dialog, DialogContent } from '@mui/material';
import GameGrid from '@components/GameGrid';
import { useGame } from '@hooks/useGame';
import '@styles/Game.scss';

const Game = () => {
    const {
        maxSelections,
        grid,
        selectedTiles,
        oneAway,
        rowsSolved,
        validGame,
        handleTileClick,
        handleSubmit,
        handleCloseOneAway,
    } = useGame();

    if (!validGame) {
        return <div>Error: bad game configuration!</div>;
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

        </div >
    );
};

export default Game;
