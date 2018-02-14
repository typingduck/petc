import React from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'

import './App.css'

import HomePage from './HomePage'

function App () {
  return (
    <Switch>
      <Route exact path='/' component={HomePage} />
      <Route path='/docs:number' component={React.Component} />
    </Switch>
  )
}

export default withRouter(App)
