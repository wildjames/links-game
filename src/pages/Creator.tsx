import { Link } from 'react-router-dom'

import Button from '@mui/material/Button'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { Paper, Snackbar } from '@mui/material'

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
            <h1>Jimmylinks Editor</h1>
            <span>
                <i>
                    Click or a tile to change its word
                </i>
            </span>

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

            <Paper className="validation-message">
                {validGame ? (
                    <div
                        className="content"
                    >
                        Game OK!
                    </div>
                ) : (
                    <div
                        className="content"
                    >
                        {validationError}
                    </div>
                )}
            </Paper>

            {gameDefinition && (
                <div className='game-links'>
                    <Button
                        className="controls copy-game-link"
                        variant="contained"
                        color="primary"
                        onClick={copyGameLink}
                        disabled={!validGame}
                    >
                        Copy Game Link
                    </Button>
                    <Button
                        className="controls open-game-link"
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
