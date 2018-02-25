import React from 'react'

import './HomePage.css'
import {createNewDoc, createDemoDoc} from './model/model'

/**
 * Default home page. Shown before user starts editing document.
 */
class HomePage extends React.Component {
  constructor (props) {
    super(props)

    this.newDemoClick = this.newDemoClick.bind(this)
    this.newDocClick = this.newDocClick.bind(this)
  }

  newDocClick () {
    createNewDoc().then(doc => {
      this.props.history.push(`/docs/${doc.id}#node`)
    })
  }

  newDemoClick () {
    createDemoDoc().then(doc => {
      this.props.history.push(`/docs/${doc.id}`)
    })
  }

  render () {
    return (
      <div className='petc-pageview'>
        <h1>pannus et circulos</h1>
        <div className='petc-homepage'>
          <a id='petc-create-new' href='#new' onClick={this.newDocClick}>Create New</a>
          <br />
          <a id='petc-create-demo' href='#demo' onClick={this.newDemoClick}>Demo doc</a>
        </div>
      </div>
    )
  }
}

export default HomePage
