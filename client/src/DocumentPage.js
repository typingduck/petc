import React from 'react'

import Kanvas from './kanvas/Kanvas'
import NavBar from './controls/NavBar'
import StoreView from './controls/StoreView'
import {loadDoc, connectSocket} from './model/model'

/**
 * Document view.
 * Wraps Kanvas with controls and connects up the networking.
 */
export default class DocumentPage extends React.Component {
  constructor (props) {
    super(props)
    this.socket = null

    this.addNode = this.addNode.bind(this)
    this.addEdge = this.addEdge.bind(this)
    this.setDoc = this.setDoc.bind(this)
    this.receiveUpdate = this.receiveUpdate.bind(this)
    this.setSocket = this.setSocket.bind(this)
    this.networkFail = this.networkFail.bind(this)
  }

  componentDidMount () {
    connectSocket(this.props.docId, this.receiveUpdate)
      .then(this.setSocket)
      .catch(this.networkFail)
    loadDoc(this.props.docId)
      .then(this.setDoc)
      .catch(this.networkFail)
  }

  receiveUpdate (patch) {
    this.props.applyPatch(patch)
  }

  networkFail (err) {
    // TODO: handle
    /* eslint-disable no-console */
    /* globals console */
    console.error('network err: ', err)
    /* eslint-enable no-console */
  }

  setDoc (doc) {
    this.props.docLoaded(doc)
  }

  setSocket (socket) {
    this.socket = socket
  }

  addNode (node) {
    this.props.addNode(node)
    this.socket.addNode(node)
  }

  addEdge (edge) {
    this.props.addEdge(edge)
    this.socket.addEdge(edge)
  }

  render () {
    return (<div>
      <NavBar {...this.props} />
      <div className='petc-pageview'>
        <h1>pannus et circulos</h1>
        <Kanvas {...this.props} addNode={this.addNode} addEdge={this.addEdge} />
      </div>
      <StoreView {...this.props} />
    </div>)
  }
}
