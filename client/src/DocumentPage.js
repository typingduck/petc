import React from 'react'

import Kanvas from './kanvas/Kanvas'
import NavBar from './controls/NavBar'
import NodeClassSelector from './controls/NodeClassSelector'
import EdgeClassSelector from './controls/EdgeClassSelector'
import StoreView from './controls/StoreView'
import Trashcan from './controls/Trashcan'
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
    this.addNodeClass = this.addNodeClass.bind(this)
    this.updateNode = this.updateNode.bind(this)
    this.removeNode = this.removeNode.bind(this)
    this.addEdge = this.addEdge.bind(this)
    this.removeEdge = this.removeEdge.bind(this)
    this.addEdgeClass = this.addEdgeClass.bind(this)
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

  addNodeClass (name, style) {
    this.props.addNodeClass(name, style)
    this.socket.addNodeClass(name, style)
  }

  updateNode (node) {
    this.props.updateNode(node)
    this.socket.updateNode(node)
  }

  removeNode (nodeId) {
    this.props.removeNode(nodeId)
    this.socket.removeNode(nodeId)
  }

  addEdge (edge) {
    this.props.addEdge(edge)
    this.socket.addEdge(edge)
  }

  removeEdge (edgeId) {
    this.props.removeEdge(edgeId)
    this.socket.removeEdge(edgeId)
  }

  addEdgeClass (name, style) {
    this.props.addEdgeClass(name, style)
    this.socket.addEdgeClass(name, style)
  }

  render () {
    return (<div>
      <NavBar {...this.props} />
      <div className='petc-pageview'>
        <h1>pannus et circulos</h1>
        <Kanvas
          {...this.props}
          addNode={this.addNode}
          removeNode={this.removeNode}
          updateNode={this.updateNode}
          addEdge={this.addEdge}
          removeEdge={this.removeEdge}
        />
        <Trashcan {...this.props} />
        <NodeClassSelector
          {...this.props}
          addNode={this.addNode}
          addNodeClass={this.addNodeClass}
          addEdge={this.addEdge}
          updateNode={this.updateNode}
          removeNode={this.removeNode}
        />
        <EdgeClassSelector
          {...this.props}
          addEdgeClass={this.addEdgeClass}
        />
      </div>
      <StoreView {...this.props} />
    </div>)
  }
}
