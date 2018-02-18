import React from 'react'
import {jsPlumb} from 'jsplumb'

import './Kanvas.css'
import {createNode, createEdge} from '../model/model'

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
    // if selected then deslect, otherwise add new
    if (!this.state.selectedNode) {
      this.props.addNode(createNode(ev.pageX - 25, ev.pageY - 25))
    }
    this.setState({selectedNode: null})
  }

  selectNode (nodeId) {
    // If existing selected node then join, otherwise select
    if (this.state.selectedNode && nodeId !== this.state.selectedNode) {
      this.props.addEdge(createEdge(this.state.selectedNode, nodeId))
      this.setState({selectedNode: null})
    } else {
      this.setState({selectedNode: nodeId})
    }
  }

  render () {
    const nodes = !this.state.jsPlmb ? null : Object.values(this.props.doc.nodes).map(node =>
      <Node key={node.id} jsPlmb={this.state.jsPlmb} node={node} selectNode={this.selectNode} selected={node.id === this.state.selectedNode} updateNode={this.props.updateNode} />
    )
    const edges = !this.state.jsPlmb ? null : Object.values(this.props.doc.edges).map(edge =>
      <Edge key={edge.id} jsPlmb={this.state.jsPlmb} source={edge.source} target={edge.target} />
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
    this._isMounted = true
  }

  onDragStart () { }

  onDrag () { }

  onDragStop (ev) {
    const [x, y] = ev.finalPos
    const newNode = Object.assign({}, this.props.node, {x, y})
    this.props.updateNode(newNode)
  }

  handleClick (ev) {
    ev.stopPropagation()
    this.props.selectNode(this.nodeId)
  }

  render () {
    const x = this.props.node.x
    const y = this.props.node.y
    if (this._isMounted) {  // need to render the element once before jsplumb can see it
      // This only exists to force redraw when another client moves a node. Can
      // possibly be optimized to prevent so many calls.
      this.props.jsPlmb.repaint(this.nodeId, {left: x, top: y})
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
    const edge = {source: this.props.source, target: this.props.target}
    const connection = this.props.jsPlmb.connect(edge)
    this.setState({connection: connection})
  }

  componentWillUnmount () {
    this.props.jsPlmb.detach(this.state.connection)
  }

  render () {
    return null
  }
}

export default Kanvas
