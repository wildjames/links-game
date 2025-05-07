import { Link } from 'react-router-dom'

import Button from '@mui/material/Button'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { Snackbar } from '@mui/material'

import '@styles/Creator.scss'

import { PATHS } from '@constants/environment'

import useEditor from '@hooks/useEditor'

import GroupedButtons from '@components/GroupedButtons'
import CreatorGrid from '@components/CreatorGrid'


const CreatorPage = () => {
    const {
        rows,
        setRows,
        categorySize,
        setCategorySize,
        grid,
        editingTileId,
        gameDefinition,
        open,
        handleTileClick,
        handleTileTextChange,
        copyGameLink,
        handleCloseSnackbar,
        handleClearWords,
        validGame,
        validationError,
    } = useEditor()

    return (
        <div className="creator-page">
            <h1>Links</h1>
            <h2>Game Creator</h2>

            <div className="controls">
                <GroupedButtons
                    counter={rows}
                    setCounter={setRows}
                    min={2}
                    max={10}
                    label="Rows"
                />
                <GroupedButtons
                    counter={categorySize}
                    setCounter={setCategorySize}
                    min={2}
                    max={10}
                    label="Category Size"
                />
            </div>

            <Button
                variant="contained"
                color="error"
                onClick={handleClearWords}
                className="clear-button"
            >
                <DeleteForeverIcon />
                <span className="clear-button-text">Clear</span>
            </Button>

            <CreatorGrid
                wordGrid={grid}
                handleTileClick={handleTileClick}
                editingTileId={editingTileId}
                onTileTextChange={handleTileTextChange}
            />

            <div className="validation-error">
                {validGame ? (
                    <span className="valid">Game OK!</span>
                ) : (
                    <span className="invalid">{validationError}</span>
                )}
            </div>

            {gameDefinition && (
                <div className='game-links'>
                    <div className="controls copy-game-link">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={copyGameLink}
                            disabled={!validGame}
                        >
                            Copy Game Link
                        </Button>
                    </div>
                    <div className="controls open-game-link">
                        <Button
                            variant="contained"
                            color="secondary"
                            component={Link}
                            to={`${PATHS.GAME}?data=${gameDefinition}`}
                            target="_blank"
                            disabled={!validGame}
                        >
                            Go to game (new tab)
                        </Button>
                    </div>
                </div>
            )}

            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message="Copied to clipboard!"
            />
        </div>
    )
}

export default CreatorPage
