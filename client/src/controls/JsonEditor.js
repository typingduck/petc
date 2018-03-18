import React from 'react'
import ReactJson from 'react-json-view'
import Modal from './Modal'

import './JsonEditor.css'

/**
 * Default home page. Shown before user starts editing document.
 */
class JsonEditor extends React.Component {
  constructor (props) {
    super(props)
    this._src = props.json
    this._name = null
    this.state = { nameWarning: false }

    // This binding is necessary to make `this` work in the callback
    this.update = this.update.bind(this)
    this.apply = this.apply.bind(this)
    this.cancel = this.cancel.bind(this)
  }

  update (e) {
    this._src = e.updated_src
  }

  onNameChange (value) {
    if (value) {
      this._name = value.trim()
    }
  }

  apply () {
    if (this._name) {
      this.props.onApply(this._name, this._src)
    } else {
      this.setState({ nameWarning: true })
    }
  }

  cancel () {
    this.setState({ nameWarning: false })
    this.props.onCancel()
  }

  render () {
    return (
      <Modal
        className='petc-json-editor'
        isOpen={this.props.isOpen}
        onRequestClose={this.cancel}
        pageX='10%'
        pageY='10%'
      >
        <div className='petc-json-editor-name'>
          name:
          <input
            type='text'
            onChange={(ev) => this.onNameChange(ev.target.value)}
            style={this.state.nameWarning ? { borderColor: 'red' } : null}
          />
        </div>
        <div tabIndex='1'>
          <ReactJson
            name={null}
            src={this.props.json}
            onEdit={this.update}
            onAdd={this.update}
            onDelete={this.update}
            displayObjectSize={false}
            collapsed={1}
            displayDataTypes={false}
            enableClipboard={false}
            iconStyle='circle'
            style={{ fontFamily: null }}
          />
        </div>
        <div style={{textAlign: 'center'}}>
          <button onClick={this.apply}>apply</button>
          <button onClick={this.cancel}>cancel</button>
        </div>
      </Modal>
    )
  }
}

export default JsonEditor
