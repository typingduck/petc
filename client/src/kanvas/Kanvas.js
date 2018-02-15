import React from 'react'

import './Kanvas.css'

/**
 * Show nodes as circles on the page.
 */
class Kanvas extends React.Component {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (ev) {
    this.props.addNode(ev.clientX - 25, ev.clientY - 25)
  }

  render () {
    return (
      <div className='petc-kanvas' onClick={this.handleClick}>
        {this.props.doc.nodes.map(node =>
          <div className='node' key={node.id} style={{left: node.x, top: node.y}} />
        )}
      </div>
    )
  }
}

export default Kanvas
