import React from 'react'

import './HomePage.css'
import createNewDoc from './model/model.js'

/**
 * Default home page. Shown before user starts editing document.
 */
export default class HomePage extends React.Component {
  constructor (props) {
    super(props)

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    console.log('create new')
    const doc = createNewDoc()
    console.log('create new: ' + JSON.stringify(doc))
  }

  render () {
    return (
      <div className='petc-homepage'>
        <a href='#new' onClick={this.handleClick}>Create New</a>
      </div>
    )
  }
}
