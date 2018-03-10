import React from 'react'
import Modal from './Modal'

import './AttributeEditor.css'
import {DEFAULT_CLASS_NAME} from '../model/model'

/**
 * Modal to edit label/class of edges or nodes.
 * A temporary solution using a dialog. Would be much better to edit in place
 * to keep the look and feel of a whiteboard but that will require a lot
 * more client side code to enable the feeling.
 */
class AttributeEditor extends React.Component {
  constructor (props) {
    super(props)

    this.state = {

      openEditor: false,
      label: null,
      className: null,
      classes: []
    }

    this.update = this.update.bind(this)
    this.apply = this.apply.bind(this)
    this.cancel = this.cancel.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    const editAttributes = nextProps.controls.editAttributes
    const openEditor = Boolean(editAttributes)
    if (openEditor) {
      const itemId = nextProps.controls.editAttributes.id
      let toEdit, classes
      if (nextProps.doc.nodes[itemId]) {
        toEdit = nextProps.doc.nodes[itemId]
        classes = Object.keys(nextProps.doc.style.nodes)
      } else if (nextProps.doc.edges[itemId]) {
        toEdit = nextProps.doc.edges[itemId]
        classes = Object.keys(nextProps.doc.style.edges)
      } else {
        return
      }
      if (!classes.includes(DEFAULT_CLASS_NAME)) {
        classes = [DEFAULT_CLASS_NAME].concat(classes)
      }
      this.setState({
        openEditor: openEditor,
        label: toEdit.label || '',
        classes: classes,
        className: toEdit.className || DEFAULT_CLASS_NAME,
        pageX: editAttributes.pageX + 5,
        pageY: editAttributes.pageY + 5
      })
    } else {
      this.setState({ openEditor: false })
    }
  }

  update (e) {
    this._src = e.updated_src
  }

  onLabelChange (value) {
    this.setState({label: value})
  }

  onClassChange (value) {
    this.setState({className: value})
  }

  apply () {
    const itemId = this.props.controls.editAttributes.id
    if (getNode(this.props, itemId)) {
      const node = Object.assign({}, getNode(this.props, itemId))
      node.label = this.state.label
      node.className = this.state.className
      this.props.updateNode(node)
    } else if (getEdge(this.props, itemId)) {
      const edge = Object.assign({}, getEdge(this.props, itemId))
      edge.label = this.state.label
      edge.className = this.state.className
      this.props.updateEdge(edge)
    }
    this.cancel()
  }

  cancelNode () {
    this.setState({label: null, className: null})
    this.props.onCancel()
  }

  cancel () {
    this.props.setEditAttributes(null)
  }

  render () {
    return (
      <Modal
        className='petc-attr-editor'
        isOpen={this.state.openEditor}
        onRequestClose={this.cancel}
        pageX={this.state.pageX}
        pageY={this.state.pageY}
      >
        <table><tbody>
          <tr>
            <td>label:</td>
            <td>
              <input
                type='text'
                onChange={(ev) => this.onLabelChange(ev.target.value)}
                value={this.state.label}
              />
            </td>
          </tr>
          <tr>
            <td>class:</td>
            <td>
              <select
                value={this.state.className}
                onChange={(ev) => this.onClassChange(ev.target.value)}
              >
                {this.state.classes.map(className =>
                  <option key={className}>{className}</option>
                )}
              </select>
            </td>
          </tr>
        </tbody></table>
        <div style={{textAlign: 'center'}}>
          <button onClick={this.apply}>apply</button>
          <button onClick={this.cancel}>cancel</button>
        </div>
      </Modal>
    )
  }
}

function getNode (props, nodeId) {
  return props.doc.nodes[nodeId]
}

function getEdge (props, edgeId) {
  return props.doc.edges[edgeId]
}

export default AttributeEditor
