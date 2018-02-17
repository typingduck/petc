import React from 'react'

import './HomePage.css'
import {createNewDoc} from './model/model'

/**
 * Default home page. Shown before user starts editing document.
 */
class HomePage extends React.Component {
  constructor (props) {
    super(props)

    // This binding is necessary to make `this` work in the callback
    this.newDocClick = this.newDocClick.bind(this)
  }

  newDocClick () {
    const history = this.props.history
    createNewDoc().then(doc => {
      history.push('/docs/' + doc.id)
    })
  }

  render () {
    return (
      <div className='petc-pageview'>
        <h1>pannus et circulos</h1>
        <div className='petc-homepage'>
          <a id='petc-create-new' href='#new' onClick={this.newDocClick}>Create New</a>
        </div>
      </div>
    )
  }
}

export default HomePage
