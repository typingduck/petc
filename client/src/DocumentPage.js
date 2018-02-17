import React from 'react'
import uuid from 'uuid/v4'

import Kanvas from './kanvas/Kanvas'
import NavBar from './controls/NavBar'
import StoreView from './controls/StoreView'
import {loadDoc, connectSocket} from './model/model.js'

/**
 * Document view
 */
export default class DocumentPage extends React.Component {
  constructor (props) {
    super(props)
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
    connectSocket(this.props.docId, this.receiveUpdate).then(this.setSocket)
    loadDoc(this.props.docId).then(this.setDoc)
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
      <NavBar {...this.props}/>
      <Kanvas {...this.props} addNode={this.addNode} />
      <StoreView {...this.props} />
    </div>)
  }
}
