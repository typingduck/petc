import React from 'react'

import './EdgeClassSelector.css'
import {jsPlumb} from 'jsplumb'

class EdgeClassSelector extends React.Component {
  render () {
    if (this.props.controls.isEdgeMode) {
      return <EdgeClassSelectorInternal {...this.props} />
    } else {
      return null
    }
  }
}

class EdgeClassSelectorInternal extends React.Component {
  constructor (props) {
    super(props)
    this.state = { jsPlmb: null }
    this.handleClassSelect = this.handleClassSelect.bind(this)
  }

  componentDidMount () {
    this.setState({
      jsPlmb: jsPlumb.getInstance({ Container: 'petc-edge-select-control' })
    })
  }

  classSelected (edgeClass) {
    return this.props.controls.selectedEdgeClass === edgeClass
  }

  handleClassSelect (edgeClass) {
    edgeClass = this.classSelected(edgeClass) ? null : edgeClass
    this.props.selectEdgeClass(edgeClass)
  }

  liClassName (className) {
    return this.classSelected(className) ? 'selected' : null
  }

  render () {
    const edgeClasses = (this.state.jsPlmb && Object.assign(
      { default: {} },
      (this.props.doc.style && this.props.doc.style.edges) || {}
    )) || {}
    return (
      <div id='petc-edge-select-control'>
        <ul>
          {Object.entries(edgeClasses).map(([className, style]) =>
            <li
              key={className}
              className={this.liClassName(className)}
              onClick={() => this.handleClassSelect(className)}
            >
              <EdgeClassElement
                edgeClassName={className}
                edgeStyle={style}
                jsPlmb={this.state.jsPlmb}
              />
              <div>{className}</div>
            </li>
          )}
        </ul>
      </div>
    )
  }
}

class EdgeClassElement extends React.Component {
  componentDidMount () {
    const edgeInfo = { source: this.endpointId('a'), target: this.endpointId('b') }
    Object.assign(edgeInfo, this.props.edgeStyle)
    this._connection = this.props.jsPlmb.connect(edgeInfo)
  }

  componentWillUnmount () {
    this.props.jsPlmb.deleteConnection(this._connection)
  }

  endpointId (endpoint) {
    return `petc-edge-select-element-${this.props.edgeClassName}-${endpoint}`
  }

  render () {
    return (
      <div className='petc-edge-select-element'>
        <div id={this.endpointId('a')} className='petc-edge-select-node-a' />
        <div id={this.endpointId('b')} className='petc-edge-select-node-b' />
      </div>
    )
  }
}

export default EdgeClassSelector
