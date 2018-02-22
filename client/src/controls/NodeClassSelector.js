import React from 'react'
import Draggable from 'react-draggable'

import './NodeClassSelector.css'
import {createNode} from '../model/model'

class NodeClassSelector extends React.Component {
  constructor (props) {
    super(props)
    this._mouseDown = false

    this.dragHandleStop = this.dragHandleStop.bind(this)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.createNodeClassView = this.createNodeClassView.bind(this)
  }

  dragHandleStop (ev, data) {
    const nodeClass = Array.from(data.node.classList)
      .filter(s => !s.includes('react-draggable'))
      .filter(s => !s.includes('default'))
      .filter(s => !s.includes('petc-node'))
      .join(' ')
      .trim()

    if (data.x < 60) {
      // treat as a click
    } else {
      this._mouseDown = false
      let borderWidth = parseInt(ev.target.style.borderWidth, 10)
      if (isNaN(borderWidth)) {
        borderWidth = 10  // .petc-node default border width in css
      }
      const kanvasPageOffset = 10
      let x = ev.pageX - (kanvasPageOffset + borderWidth + ev.offsetX)
      let y = ev.pageY - (kanvasPageOffset + borderWidth + ev.offsetY)
      this.props.addNode(createNode(x, y, nodeClass))
    }
  }

  classSelected (nodeClass) {
    return this.props.controls.selectedNodeClass === nodeClass
  }

  onMouseDown () {
    // work around for distinguishing click from drag
    this._mouseDown = true
  }

  handleClassSelect (nodeClass) {
    if (this._mouseDown) {
      if (this.classSelected(nodeClass)) {
        this.props.selectNodeClass(null)
      } else {
        this.props.selectNodeClass(nodeClass)
      }
      this._mouseDown = false
    }
  }

  liClassName (className) {
    return this.classSelected(className) ? 'selected' : null
  }

  createNodeClassView (className, style) {
    let fullClassName = 'petc-node ' + className
    return (<li key={className} className={this.liClassName(className)} onMouseDown={this.onMouseDown} onMouseUp={() => this.handleClassSelect(className)}>
      <Draggable position={{x: 0, y: 0}} onStop={this.dragHandleStop}>
        <div className={fullClassName} style={style} />
      </Draggable>
      <div>{className}</div>
    </li>)
  }

  render () {
    const nodeClasses = Object.assign(
      { default: {} },
      (this.props.doc.style && this.props.doc.style.nodes) || {}
    )

    if (this.props.controls.isNodeMode) {
      return (
        <div id='petc-node-select-control'>
          <ul>
            {Object.entries(nodeClasses).map(([className, style]) =>
              this.createNodeClassView(className, style)
            )}
          </ul>
        </div>
      )
    } else {
      return null
    }
  }
}

export default NodeClassSelector
