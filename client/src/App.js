import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'

import {store, connectStore} from './store'

import HomePage from './HomePage'
import DocumentPage from './DocumentPage'

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <Route exact path='/' component={HomePage} />
        <Route path='/docs/:docId' component={connectStore(DocumentPage)} />
      </Switch>
    </BrowserRouter>
  </Provider>
)

export default App
