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
    this.props.addNode(createNode(ev.pageX - 25, ev.pageY - 25))
    this.setState({selectedNode: null})
  }

  selectNode (nodeId) {
    if (this.state.selectedNode) {
      this.props.addEdge(createEdge(this.state.selectedNode, nodeId))
      this.setState({selectedNode: null})
    } else {
      this.setState({selectedNode: nodeId})
    }
  }

  render () {
    const nodes = Object.values(this.props.doc.nodes).map(node =>
      <Node key={node.id} id={node.id} x={node.x} y={node.y} selectNode={this.selectNode} selected={node.id === this.state.selectedNode} />
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

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (ev) {
    ev.stopPropagation()
    this.props.selectNode(this.props.id)
  }

  render () {
    const style = {left: this.props.x, top: this.props.y}
    const className = this.props.selected ? 'petc-node petc-node-selected' : 'petc-node'
    return (
      <div
        id={this.props.id}
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
