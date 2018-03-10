import React from 'react'
import './Modal.css'

/**
 * Replaces React Modal with a a simple implementation because react modal
 * attaches elements in portals which makes tests harder.
 */
export default class Modal extends React.Component {
  render () {
    if (this.props.isOpen) {
      return (
        <div className='petc-modal-overlay' onClick={this.props.onRequestClose}>
          <div
            className={'petc-modal ' + this.props.className}
            onClick={stopPropagation}
            style={{left: this.props.pageX, top: this.props.pageY}}
          >
            {this.props.children}
          </div>
        </div>
      )
    } else {
      return null
    }
  }
}

function stopPropagation (ev) {
  ev.stopPropagation()
}
