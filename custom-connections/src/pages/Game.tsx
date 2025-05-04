import { Button } from '@mui/material';
import GameGrid from '@components/GameGrid';
import { useGame } from '@hooks/useGame';
import '@styles/Game.scss';

const Game = () => {
    const {
        maxSelections,
        grid,
        selectedTiles,
        rowsSolved,
        validGame,
        handleTileClick,
        handleSubmit,
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
        </div>
    );
};

export default Game;
