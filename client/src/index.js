import React from 'react'
import ReactDOM from 'react-dom'

import './index.css'
import App from './App'
import './kanvas/Kanvas'
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('petc-react-container'))
registerServiceWorker();
