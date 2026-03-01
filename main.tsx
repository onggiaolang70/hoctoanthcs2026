import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // Kết nối với file App.tsx chứa giao diện của Thầy

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)