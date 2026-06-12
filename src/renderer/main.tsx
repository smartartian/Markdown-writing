import React from 'react'
import ReactDOM from 'react-dom/client'
import mermaid from 'mermaid/dist/mermaid.min.js'
import App from './App'
import './assets/styles/globals.css'

mermaid.initialize({ startOnLoad: false, theme: 'default' })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
