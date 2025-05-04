import { Link } from 'react-router-dom'

import Button from '@mui/material/Button'
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
        handleCloseSnackbar
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

            <CreatorGrid
                wordGrid={grid}
                handleTileClick={handleTileClick}
                editingTileId={editingTileId}
                onTileTextChange={handleTileTextChange}
            />

            <div className="controls">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={copyGameLink}
                    disabled={!gameDefinition}
                >
                    Copy Game Link
                </Button>
            </div>

            {gameDefinition && (
                <div className="game-definition">
                    <Button
                        component={Link}
                        to={`${PATHS.GAME}?data=${gameDefinition}`}
                        target="_blank"
                        disabled={!gameDefinition}
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
