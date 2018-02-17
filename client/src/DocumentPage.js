import React from 'react'
import uuid from 'uuid/v4'

import {loadDoc, connectSocket} from './model/model.js'
import Kanvas from './kanvas/Kanvas'
import StoreView from './controls/StoreView'

/**
 * Document view
 */
export default class DocumentPage extends React.Component {
  constructor (props) {
    super(props)
    this.docId = props.match.params.docId
    this.socket = null

    this.addNode = this.addNode.bind(this)
    this.setDoc = this.setDoc.bind(this)
    this.receiveUpdate = this.receiveUpdate.bind(this)
    this.setSocket = this.setSocket.bind(this)
  }

  receiveUpdate (patch) {
    this.props.applyPatch(patch)
  }

  componentDidMount () {
    connectSocket(this.docId, this.receiveUpdate).then(this.setSocket)
    loadDoc(this.docId).then(this.setDoc)
  }

  setDoc (doc) {
    this.props.docLoaded(doc)
  }

  setSocket (socket) {
    this.socket = socket
  }

  addNode (x, y) {
    const id = uuid()
    const node = {id, x, y}
    this.props.addNode(node)
    this.socket.addNode(node)
  }

  render () {
    return (<div>
      <Kanvas {...this.props} addNode={this.addNode} />
      <StoreView {...this.props} />
      </div>
    )
  }
}
