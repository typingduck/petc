/* global setTimeout jsPlumb */
import React from 'react'

import './Kanvas.css'
import {createNode, createEdge, DEFAULT_CLASS_NAME} from '../model/model'
import {isInTrashCan} from '../controls/Trashcan'

const JSPLUMP_DEFAULTS = {
  Container: 'petc-kanvas',
  PaintStyle: {
    strokeWidth: 2,
    stroke: 'rgba(100, 100, 100, 0.5)'
  },
  Connector: [ 'StateMachine', { curviness: 10, margin: 3, proximityLimit: 80 } ],
  Endpoint: [ 'Dot', { radius: 1 } ],
  EndpointStyle: { fill: 'none' },
  Anchor: [ 'Continuous', { shape: 'Circle' } ]
}

const END_VISIBLE = ['Dot', { radius: 6, cssClass: 'petc-endpoint', hoverClass: 'petc-node-selected' }]
const END_INVISIBLE = ['Dot', { radius: 6, cssClass: 'petc-endpoint petc-hidden', hoverClass: 'petc-node-selected' }]

/**
 * Show nodes as circles on the page.
 */
class Kanvas extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}

    this.nodeClick = this.nodeClick.bind(this)
    this.onConnectionDetach = this.onConnectionDetach.bind(this)
    this.pageClick = this.pageClick.bind(this)
  }

  componentDidMount () {
    const jsp = jsPlumb.getInstance({ Container: JSPLUMP_DEFAULTS.Container })
    // Fix for jsplumb overwritting prototype Defaults
    jsp.Defaults = Object.assign({}, jsp.Defaults, JSPLUMP_DEFAULTS)
    jsp.bind('connectionDetached', this.onConnectionDetach)
    this.setState({jsPlmb: jsp})
  }

  onConnectionDetach (info, ev) {
    if (ev) {  // mouse event indicates jsplumb directed removal
      const edgeId = info.connection.getData().edgeId
      const props = this.props
      if (this.props.doc.edges[edgeId]) {
        // use timeout to fix race condition in jsPlumb
        setTimeout(() => props.removeEdge(edgeId))
      }
    }
  }

  pageClick (ev) {
    if (ev.target.id === 'petc-kanvas') {
      if (this.props.controls.isNodeMode) {
        this.props.addNode(createNode(ev.pageX - 25, ev.pageY - 25,
          this.props.controls.selectedNodeClass))
      }
      this.setState({selectedNode: null})
    }
  }

  nodeClick (node) {
    const nodeId = node.id
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
    if (this.state.jsPlmb) {
      if (this.props.controls.isEdgeMode) {
        this.state.jsPlmb.importDefaults({ Endpoint: END_VISIBLE })
      } else {
        this.state.jsPlmb.importDefaults({ Endpoint: END_INVISIBLE })
      }
    }
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
        nodeClick={this.nodeClick}
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
      <div id='petc-kanvas' onClick={this.pageClick}>
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

    this.nodeClick = this.nodeClick.bind(this)
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
      this.props.removeNode(newNode.id)
    } else {
      this.props.updateNode(newNode)
    }
  }

  nodeClick (ev) {
    this.props.nodeClick(this.props.node, ev)
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
          onClick={this.nodeClick}
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
    const edgeClassName = edge.className || DEFAULT_CLASS_NAME
    const optStyle = this.props.doc.style.edges[edgeClassName]
    if (optStyle) {
      Object.assign(edgeInfo, optStyle)
    }
    if (edge.label) {
      edgeInfo.overlays.push(this.createLabelOverlay(edge))
    }
    edgeInfo.data = { edgeId: edge.id }
    this._connection = this.props.jsPlmb.connect(edgeInfo)
  }

  componentWillUnmount () {
    try {
      this.props.jsPlmb.deleteConnection(this._connection)
    } catch (e) {
      // ignore if already removed
    }
  }

  componentDidUpdate () {
    if (this._connection) {
      toggleClass(this._connection.endpoints[0].canvas, 'petc-hidden', !this.props.controls.isEdgeMode)
      toggleClass(this._connection.endpoints[1].canvas, 'petc-hidden', !this.props.controls.isEdgeMode)
    }
  }

  createLabelOverlay (edge) {
    const labelId = el(edge.id)
    return [ 'Label', { label: edge.label, cssClass: 'petc-edge-label', id: labelId } ]
  }

  render () {
    // could return null, but return something helps with testing
    return <div id={this.props.edge.id} />
  }
}

function toggleClass (ele, className, add) {
  if (add) {
    ele.classList.add(className)
  } else {
    ele.classList.remove(className)
  }
}

/**
 * Id of wrappper containing the node and its label.
 */
function nw (nodeId) {
  return nodeId + '-wrapper'
}

/**
 * Id of label of an edge
 */
function el (edgeId) {
  return edgeId + '-label'
}

export default Kanvas
