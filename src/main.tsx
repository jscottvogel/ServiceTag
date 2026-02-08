/**
 * @fileoverview Main application entry point
 * @description Configures AWS Amplify and renders the root React application.
 * This file initializes the Amplify backend connection and mounts the App component.
 * 
 * @requires react
 * @requires react-dom/client
 * @requires aws-amplify
 * @requires ./App
 * @requires ./index.css
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import './amplify-config'
import App from './App.tsx'
import './index.css'

/**
 * Get the root DOM element and render the React application
 * @description Uses React 18's createRoot API for concurrent rendering
 * StrictMode is enabled to highlight potential problems in development
 */
const rootElement = document.getElementById('root')

if (!rootElement) {
    throw new Error('Failed to find the root element. Ensure index.html contains a div with id="root"')
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
