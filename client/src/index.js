import React from 'react'
import ReactDOM from 'react-dom'

import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

/* global document */

ReactDOM.render(<App />, document.getElementById('petc-react-container'))
registerServiceWorker()
