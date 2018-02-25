import React from 'react'
import {jsPlumb} from 'jsplumb'

import './EdgeClassSelector.css'
import JsonEditor from './JsonEditor'

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
    this.state = { jsPlmb: null, edgeClassDialogVisible: false }

    this.handleClassSelect = this.handleClassSelect.bind(this)
    this.newEdgeClassFromEditor = this.newEdgeClassFromEditor.bind(this)
    this.toggleNewEdgeClassDialog = this.toggleNewEdgeClassDialog.bind(this)
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

  toggleNewEdgeClassDialog () {
    this.setState({ edgeClassDialogVisible: !this.state.edgeClassDialogVisible })
  }

  newEdgeClassFromEditor (name, style) {
    this.toggleNewEdgeClassDialog()
    this.props.addEdgeClass(name, style)
  }

  hideNewEdgeClassDialog () {
    this.setState({ edgeClassDialogVisible: false })
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
          <li onClick={this.toggleNewEdgeClassDialog}> + new </li>
        </ul>
        <JsonEditor
          json={templateEdgeClass()}
          onCancel={this.toggleNewEdgeClassDialog}
          onApply={this.newEdgeClassFromEditor}
          isOpen={this.state.edgeClassDialogVisible}
        />
      </div>
    )
  }
}

function templateEdgeClass () {
  return {
    paintStyle: {
      stroke: 'grey',
      strokeWidth: 2
    },
    hoverPaintStyle: { stroke: 'cyan' },
    anchors: [ 'AutoDefault', 'AutoDefault' ],
    overlays: [
      ['Arrow', { width: 20, length: 22, location: 1.0, cssClass: 'petc-arrow' }],
      ['Arrow', { width: 20, length: 22, location: 0, cssClass: 'petc-arrow', direction: -1 }]
    ],
    connector: [ 'Bezier' ]
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
