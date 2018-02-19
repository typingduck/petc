import React from 'react'
import {jsPlumb} from 'jsplumb'

import './Kanvas.css'
import {createNode, createEdge} from '../model/model'
import {isInTrashCan} from '../controls/Trashcan'

const JSPLUMP_DEFAULTS = {
  Container: 'petc-kanvas',
  PaintStyle: {
    strokeWidth: 6,
    stroke: 'grey'
  },
  Connector: [ 'Straight' ],
  Endpoint: [ 'Dot', { radius: 3 } ],
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
    this.setState({jsPlmb: jsPlumb.getInstance(JSPLUMP_DEFAULTS)})
  }

  handleClick (ev) {
    if (this.props.controls.isNodeMode) {
      this.props.addNode(createNode(ev.pageX - 25, ev.pageY - 25))
    }
    this.setState({selectedNode: null})
  }

  selectNode (nodeId) {
    if (this.props.controls.isEdgeMode) {
      // If existing selected node then connect, otherwise select
      if (this.state.selectedNode && nodeId !== this.state.selectedNode) {
        this.props.addEdge(createEdge(this.state.selectedNode, nodeId))
        this.setState({selectedNode: null})
      } else {
        this.setState({selectedNode: nodeId})
      }
    }
  }

  render () {
    const selectedNode = this.props.controls.isEdgeMode && this.state.selectedNode
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
      <Edge
        key={edge.id}
        edge={edge}
        jsPlmb={this.state.jsPlmb}
      />
    )

    return (
      <div className='petc-kanvas' onClick={this.handleClick}>
        {nodes}
        {edges}
      </div>
    )
  }
}

class Node extends React.Component {
  constructor (props) {
    super(props)
    this.nodeId = this.props.node.id
    this._isMounted = false

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
    }
    this.props.jsPlmb.draggable(this.nodeId, dragOptions)
    this.props.jsPlmb.setDraggable(this.nodeId, this.props.controls.isNodeMode)
    this._isMounted = true
  }

  componentWillUnmount () {
    this.props.jsPlmb.removeAllEndpoints(this.nodeId)
  }

  onDragStart () { }

  onDrag (ev) {
    this.props.draggingNode({
      id: this.nodeId,
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
    this.props.selectNode(this.nodeId)
  }

  render () {
    const x = this.props.node.x
    const y = this.props.node.y
    if (this._isMounted &&  // need to render the element once before jsplumb can see it
        !this.props.controls.dragNode) {
      // This only exists to force redraw when another client moves a node. Can
      // possibly be optimized to prevent so many calls.
      this.props.jsPlmb.repaint(this.nodeId, {left: x, top: y})
      this.props.jsPlmb.setDraggable(this.nodeId, this.props.controls.isNodeMode)
    }
    const style = {left: x, top: y}
    const className = this.props.selected ? 'petc-node petc-node-selected' : 'petc-node'
    return (
      <div
        id={this.nodeId}
        className={className}
        style={style}
        onClick={this.handleClick}
      />
    )
  }
}

class Edge extends React.Component {
  componentDidMount () {
    const connection = this.props.jsPlmb.connect(this.props.edge)
    this.setState({connection: connection})
  }

  componentWillUnmount () {
    // this.props.jsPlmb.detach(this.state.connection)
  }

  render () {
    // could return null, but return something helps with testing
    return <div id={this.props.edge.id} />
  }
}

export default Kanvas
