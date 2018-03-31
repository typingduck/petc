import React from 'react'
import Draggable from 'react-draggable'

import './NodeClassSelector.css'
import JsonEditor from './JsonEditor'
import {createNode, DEFAULT_CLASS_NAME} from '../model/model'

class NodeClassSelector extends React.Component {
  constructor (props) {
    super(props)
    this._mouseDown = false
    this.state = { nodeClassDialogVisible: false }

    this.createNodeClassView = this.createNodeClassView.bind(this)
    this.dragHandleStop = this.dragHandleStop.bind(this)
    this.newNodeClassFromEditor = this.newNodeClassFromEditor.bind(this)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.toggleNewNodeClassDialog = this.toggleNewNodeClassDialog.bind(this)
  }

  dragHandleStop (ev, data) {
    const nodeClass = Array.from(data.node.classList)
      .filter(s => !s.includes('react-draggable'))
      .filter(s => !s.includes(DEFAULT_CLASS_NAME))
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
    return this.classSelected(className) ? 'active' : null
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

  toggleNewNodeClassDialog () {
    this.setState({ nodeClassDialogVisible: !this.state.nodeClassDialogVisible })
  }

  newNodeClassFromEditor (name, style) {
    this.toggleNewNodeClassDialog()
    this.props.addNodeClass(name, style)
  }

  render () {
    const nodeClasses = Object.assign(
      { default: {} },
      (this.props.doc.style && this.props.doc.style.nodes) || {}
    )

    if (this.props.controls.isNodeMode) {
      return (
        <div id='petc-node-select-control' className='petc-controls'>
          <ul>
            {Object.entries(nodeClasses).map(([className, style]) =>
              this.createNodeClassView(className, style)
            )}
            <li onClick={this.toggleNewNodeClassDialog}> + new <br/> style </li>
          </ul>
          <JsonEditor
            isOpen={this.state.nodeClassDialogVisible}
            json={templateNodeClass()}
            onCancel={this.toggleNewNodeClassDialog}
            onApply={this.newNodeClassFromEditor}
          />
        </div>
      )
    } else {
      return null
    }
  }
}

function templateNodeClass () {
  return {
    borderRadius: '20px',
    borderWidth: '10px',
    borderColor: 'grey',
    height: '32px',
    width: '32px'
  }
}

export default NodeClassSelector
