import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CoffeeProvider } from './context/CoffeeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CoffeeProvider>
      <App />
    </CoffeeProvider>
  </React.StrictMode>,
)
