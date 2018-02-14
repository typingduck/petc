import React from 'react'
import { withRouter } from 'react-router-dom'

import './HomePage.css'
import {createNewDoc} from './model/model.js'

/**
 * Default home page. Shown before user starts editing document.
 */
class HomePage extends React.Component {
  constructor (props) {
    super(props)

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    const history = this.props.history
    createNewDoc().then(doc => {
      history.push('/docs/' + doc.id)
    })
  }

  render () {
    return (
      <div className='petc-homepage'>
        <a href='#new' onClick={this.handleClick}>Create New</a>
      </div>
    )
  }
}

export default withRouter(HomePage)
