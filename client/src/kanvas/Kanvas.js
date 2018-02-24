import React from 'react'
import {jsPlumb} from 'jsplumb'

import './Kanvas.css'
import {createNode, createEdge} from '../model/model'
import {isInTrashCan} from '../controls/Trashcan'

const JSPLUMP_DEFAULTS = {
  Container: 'petc-kanvas',
  PaintStyle: {
    strokeWidth: 2,
    stroke: 'rgba(100, 100, 100, 0.5)'
  },
  Connector: [ 'Straight' ],
  Endpoint: [ 'Dot', { radius: 1 } ],
  EndpointStyle: { fill: 'grey' },
  Anchor: [ 'Continuous', { shape: 'Circle' } ]
}

/**
 * Show nodes as circles on the page.
 */
class Kanvas extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}

    this.handleClick = this.handleClick.bind(this)
    this.selectNode = this.selectNode.bind(this)
  }

  componentDidMount () {
    window.j = jsPlumb.getInstance(JSPLUMP_DEFAULTS)
    this.setState({jsPlmb: window.j})
  }

  handleClick (ev) {
    if (this.props.controls.isNodeMode) {
      this.props.addNode(createNode(ev.pageX - 25, ev.pageY - 25,
        this.props.controls.selectedNodeClass))
    }
    this.setState({selectedNode: null})
  }

  selectNode (nodeId) {
    if (this.props.controls.isEdgeMode) {
      // If existing selected node then connect, otherwise select
      if (this.state.selectedNode && nodeId !== this.state.selectedNode) {
        this.props.addEdge(
          createEdge(this.state.selectedNode, nodeId, this.props.controls.selectedEdgeClass))
        this.setState({selectedNode: null})
      } else {
        this.setState({selectedNode: nodeId})
      }
    }
  }

  render () {
    const selectedNode = this.props.controls.isEdgeMode && this.state.selectedNode
    if (!this.props.doc.style) {
      this.props.doc.style = { nodes: {}, edges: {} }
    }
    const nodes = !this.state.jsPlmb ? null : Object.values(this.props.doc.nodes).map(node =>
      <Node
        key={node.id}
        node={node}
        {...this.props}
        jsPlmb={this.state.jsPlmb}
        selectNode={this.selectNode}
        selected={node.id === selectedNode}
        updateNode={this.props.updateNode}
      />
    )
    const edges = !this.state.jsPlmb ? null : Object.values(this.props.doc.edges).map(edge =>
      this.props.doc.nodes[edge.source] && this.props.doc.nodes[edge.target] &&
        <Edge
          key={edge.id + edge.className}
          edge={edge}
          {...this.props}
          jsPlmb={this.state.jsPlmb}
        />
    )

    return (
      <div id='petc-kanvas' onClick={this.handleClick}>
        {nodes}
        {edges}
      </div>
    )
  }
}

class Node extends React.Component {
  constructor (props) {
    super(props)
    this._nodeId = this.props.node.id
    this._isMounted = false
    this._textRotation = Math.round(10 * (Math.random() - 0.5))

    this.handleClick = this.handleClick.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
    this.onDrag = this.onDrag.bind(this)
    this.onDragStop = this.onDragStop.bind(this)
  }

  componentDidMount () {
    const dragOptions = {
      'start': this.onDragStart,
      'drag': this.onDrag,
      'stop': this.onDragStop,
      containment: true
      // grid:[25,25]
    }
    this.props.jsPlmb.draggable(nw(this._nodeId), dragOptions)
    this.props.jsPlmb.setDraggable(nw(this._nodeId), this.props.controls.isNodeMode)
    this._isMounted = true
  }

  componentWillUnmount () {
    this.props.jsPlmb.removeAllEndpoints(this._nodeId)
  }

  onDragStart () { }

  onDrag (ev) {
    this.props.draggingNode({
      id: this._nodeId,
      x: ev.e.pageX,
      y: ev.e.pageY
    })
  }

  onDragStop (ev) {
    this.props.draggingNode(null)
    const [x, y] = ev.finalPos
    const newNode = Object.assign({}, this.props.node, {x, y})
    if (isInTrashCan(newNode)) {
      this.props.removeNode(newNode)
    } else {
      this.props.updateNode(newNode)
    }
  }

  handleClick (ev) {
    ev.stopPropagation()
    this.props.selectNode(this._nodeId)
  }

  render () {
    const x = this.props.node.x
    const y = this.props.node.y
    if (this._isMounted &&  // need to render the element once before jsplumb can see it
        !this.props.controls.dragNode) {
      // This only exists to force redraw when another client moves a node. Can
      // possibly be optimized to prevent so many calls.
      this.props.jsPlmb.repaint(nw(this._nodeId), {left: x, top: y})
      this.props.jsPlmb.setDraggable(nw(this._nodeId), this.props.controls.isNodeMode)
    }
    let className = 'petc-node'
    if (this.props.selected) {
      className += ' petc-node-selected'
    }
    if (this.props.node.className) {
      className += ' ' + this.props.node.className
    }
    const nodeStyle = this.props.doc.style.nodes[this.props.node.className]
    const textStyle = { WebkitTransform: `rotate(${this._textRotation}deg)` }
    return (
      <div
        id={nw(this._nodeId)}
        style={{ position: 'absolute', left: x, top: y }}
      >
        <div
          id={this._nodeId}
          onClick={this.handleClick}
          className={className}
          style={nodeStyle}
        />
        <div className='petc-node-label' style={textStyle}>{this.props.node.label}</div>
      </div>
    )
  }
}

class Edge extends React.Component {
  componentDidMount () {
    const edge = this.props.edge
    const edgeInfo = {
      source: edge.source,
      target: edge.target,
      overlays: []
    }
    const edgeClassName = edge.className || 'default'
    const optStyle = this.props.doc.style.edges[edgeClassName]
    if (optStyle) {
      Object.assign(edgeInfo, optStyle)
    }
    if (edge.label) {
      edgeInfo.overlays.push(
        [ 'Label', { label: edge.label, cssClass: 'petc-edge-label' } ]
      )
    }
    this._connection = this.props.jsPlmb.connect(edgeInfo)
  }

  componentWillUnmount () {
    try {
      this.props.jsPlmb.deleteConnection(this._connection)
    } catch (e) {
      // ignore if already removed
    }
  }

  render () {
    // could return null, but return something helps with testing
    return <div id={this.props.edge.id} />
  }
}

/**
 * Id of wrappper containing the node and its label.
 */
function nw (nodeId) {
  return nodeId + '-wrapper'
}

export default Kanvas
