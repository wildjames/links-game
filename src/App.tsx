import { Routes, Route } from "react-router-dom"

import Layout from "./Layout"
import { PATHS } from "@constants/environment"

import "@styles/App.scss"

import NotFoundPage from "@pages/NotFound"
import GamePage from "@pages/Game"
import CreatorPage from "@pages/Creator"

export default function App() {

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route path='*' element={<NotFoundPage />} />
                <Route path={PATHS.GAME} element={<GamePage />} />
                <Route path={PATHS.CREATE} element={<CreatorPage />} />
            </Route>
        </Routes>
    )
}
