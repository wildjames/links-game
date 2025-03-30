import React from "react"
import ReactDOM from "react-dom/client"
import {BrowserRouter} from "react-router-dom"

import App from "./App"


document.body.className = document.body.className.replace("no-js", "js-enabled")

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
