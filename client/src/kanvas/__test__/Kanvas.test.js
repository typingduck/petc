/* global beforeEach document expect global it jest setTimeout */
import React from 'react'
import ReactDOM from 'react-dom'
import Renderer from 'react-test-renderer'

import {initialDoc} from '../../model/model'
import Kanvas from '../Kanvas'

jest.useFakeTimers()

Math.random = () => 0.1

const mockJsPlumb = {
  bind: jest.fn(),
  connect: jest.fn(),
  draggable: jest.fn(),
  importDefaults: jest.fn(),
  repaint: jest.fn(),
  setDraggable: jest.fn()
}

global.jsPlumb = {
  getInstance: () => mockJsPlumb
}

let mockIsInTrashCan = false

jest.mock('../../controls/Trashcan', () => (
  { isInTrashCan: jest.fn(() => mockIsInTrashCan) }
))

jest.mock('uuid/v4', () => () => 'u-u-i-d')

beforeEach(() => {
  jest.clearAllMocks()
})

const EMPTY_DOC = {
  nodes: {},
  edges: {}
}

const SINGLE_NODE_DOC = {
  nodes: {
    'node': { id: 'node', x: 100, y: 100 }
  },
  edges: {}
}

const BASIC_DOC = {
  nodes: {
    'node-a': {id: 'node-a', x: 100, y: 200},
    'node-b': {id: 'node-b', x: 200, y: 100}
  },
  edges: {
    'a-b': {id: 'a-b', source: 'node-a', target: 'node-b'}
  }
}

it('renders initial doc', () => {
  const props = viewModeProps(initialDoc())
  const component = Renderer.create(<Kanvas {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('render with nodes and edges', () => {
  const props = viewModeProps(BASIC_DOC)
  const component = Renderer.create(<Kanvas {...props} />)
  expect(component.toJSON()).toMatchSnapshot()

  const connectedEdge = getEdge('a-b')
  expect(connectedEdge.source).toEqual('node-a')
  expect(connectedEdge.target).toEqual('node-b')
  expect(connectedEdge.data).not.toBeNull()
  expect(connectedEdge.data.edgeId).toEqual('a-b')

  const nodeA = getNode(component, 'node-a')
  expect(nodeA.props.className).toEqual('petc-node')

  const nodeB = getNode(component, 'node-b')
  expect(nodeB.props.className).toEqual('petc-node')
})

it('should create node on kanvas click', () => {
  const props = editNodesProps(EMPTY_DOC)
  const component = Renderer.create(<Kanvas {...props} />)

  const tree = component.toJSON()
  tree.props.onClick({ pageX: 125, pageY: 225, target: { id: 'petc-kanvas' } })

  expect(props.addNode).toHaveBeenCalledWith({ id: 'u-u-i-d', x: 100, y: 200 })
})

it('should only create node when click is directly on kanvas', () => {
  const props = editNodesProps(EMPTY_DOC)
  const component = Renderer.create(<Kanvas {...props} />)

  const tree = component.toJSON()
  tree.props.onClick({ pageX: 125, pageY: 225, target: { id: 'node' } })

  expect(props.addNode).not.toHaveBeenCalled()
})

it('should select node in edge mode', () => {
  const props = editEdgesProps(SINGLE_NODE_DOC)
  const component = Renderer.create(<Kanvas {...props} />)

  let nodeDiv = getNode(component, 'node')
  expect(nodeDiv.props.className).toEqual('petc-node')

  // when clicking on node
  nodeDiv.props.onClick()

  // should mark node as selected
  nodeDiv = getNode(component, 'node')
  expect(nodeDiv.props.className).toEqual('petc-node petc-node-selected')

  // when clicking on kanvas
  let tree = component.toJSON()
  tree.props.onClick({ target: { id: 'petc-kanvas' } })

  // should deselect node
  nodeDiv = getNode(component, 'node')
  expect(nodeDiv.props.className).toEqual('petc-node')
})

it('should disable dragging in edge view mode', () => {
  const props = editEdgesProps(SINGLE_NODE_DOC)
  Renderer.create(<Kanvas {...props} />)

  // then dragging should be disabled
  const setDraggable = mockJsPlumb.setDraggable.mock.calls[0]
  expect(setDraggable).toEqual([ 'node-wrapper', false ])
})

it('should enable dragging in node view mode', () => {
  const props = editNodesProps(SINGLE_NODE_DOC)
  Renderer.create(<Kanvas {...props} />)

  // then dragging should be enabled
  const setDraggable = mockJsPlumb.setDraggable.mock.calls[0]
  expect(setDraggable).toEqual([ 'node-wrapper', true ])
})

it('should emit edit node on node click', () => {
  const props = editNodesProps(SINGLE_NODE_DOC)
  const component = Renderer.create(<Kanvas {...props} />)

  // then clicking on the node
  const nodeDiv = getNode(component, 'node')
  nodeDiv.props.onClick({ pageX: 123, pageY: 321 })

  // should emit edit node
  expect(props.setEditAttributes).toHaveBeenCalledWith(
    {id: 'node', pageX: 123, pageY: 321}
  )
})

it('should stop node "click" event if dragging', () => {
  const props = editNodesProps(SINGLE_NODE_DOC)
  const component = Renderer.create(<Kanvas {...props} />)

  // given jsPlumb dragging setup
  const draggable = mockJsPlumb.draggable.mock.calls[0]
  expect(draggable[0]).toEqual('node-wrapper')
  const onDragCb = draggable[1].drag
  const onDragStartCb = draggable[1].start

  // when dragging node
  onDragStartCb()
  onDragCb({ e: { pageX: 100, pageY: 200 } })
  expect(props.draggingNode).toHaveBeenCalledWith({ id: 'node', x: 100, y: 200 })

  // and then clicking on node
  const nodeDiv = getNode(component, 'node')
  nodeDiv.props.onClick({ pageX: 123, pageY: 321 })

  // should not cause click event
  expect(props.setEditAttributes).not.toHaveBeenCalled()
})

it('should emit edit edge on edge click', () => {
  const props = editEdgesProps(BASIC_DOC)
  Renderer.create(<Kanvas {...props} />)

  // when user clicks on edge
  clickEdge('a-b')

  // should emit edit edge
  expect(props.setEditAttributes).toHaveBeenCalledWith(
    {id: 'a-b', pageX: 123, pageY: 321}
  )
})

it('should delete edge on jsplumb detach callback', () => {
  const props = editEdgesProps(BASIC_DOC)
  Renderer.create(<Kanvas {...props} />)

  // when jsplumb emits detach connection
  simulateJsPlumbDetachEdge('a-b', {})

  // should emit remove edge (inside timer)
  expect(setTimeout).toHaveBeenCalledTimes(1)
  const setTimeoutFn = setTimeout.mock.calls[0][0]
  setTimeoutFn()  // run the function passed to settimeout
  expect(props.removeEdge).toHaveBeenCalledWith('a-b')
})

it('should not delete edge on jsplumb detach callback without mouse', () => {
  // 'connectionDetached' events are emitted by the user removing an edge
  // but also when the edge is programmatically removed. This test ensures
  // the code distinguishes between the two
  const props = editEdgesProps(BASIC_DOC)
  Renderer.create(<Kanvas {...props} />)

  // when jsplumb emits detach connection
  simulateJsPlumbDetachEdge('a-b', null)

  // should not emit remove node
  expect(setTimeout).toHaveBeenCalledTimes(0)
})

it('should create edge to connect nodes', () => {
  const props = editEdgesProps(BASIC_DOC)
  const component = Renderer.create(<Kanvas {...props} />)

  // given clicking on two nodes
  const nodeA = getNode(component, 'node-a')
  nodeA.props.onClick()
  const nodeB = getNode(component, 'node-b')
  nodeB.props.onClick()

  // should create an edge between them
  expect(props.addEdge).toHaveBeenCalledWith(
    {id: 'node-a-node-b', source: 'node-a', target: 'node-b'}
  )
})

it('should not connect node to itself', () => {
  const props = editEdgesProps(BASIC_DOC)
  const component = Renderer.create(<Kanvas {...props} />)

  // given clicking on two nodes
  const nodeA = getNode(component, 'node-a')
  nodeA.props.onClick()
  nodeA.props.onClick()

  // should create an edge between them
  expect(props.addEdge).not.toHaveBeenCalled()
})

it('should delete node if in trashcan', () => {
  const props = editEdgesProps(SINGLE_NODE_DOC)
  Renderer.create(<Kanvas {...props} />)

  // given jsPlumb dragging setup
  const draggable = mockJsPlumb.draggable.mock.calls[0]
  expect(draggable[0]).toEqual('node-wrapper')
  const onDragCb = draggable[1].drag
  const onDragStartCb = draggable[1].start
  const onDragStopCb = draggable[1].stop

  // and dragging node started
  onDragStartCb()
  onDragCb({ e: { pageX: 100, pageY: 200 } })

  // when dragging stops and is in trash can
  mockIsInTrashCan = true
  onDragStopCb({ finalPos: [1000, 2000] })

  // should emit delete node
  expect(props.removeNode).toHaveBeenCalledWith('node')
})

it('should show node label', () => {
  const props = viewModeProps(SINGLE_NODE_DOC)
  props.doc.nodes['node'].label = 'a label'
  const component = Renderer.create(<Kanvas {...props} />)

  expect(component.toJSON()).toMatchSnapshot()

  const tree = component.toJSON()
  const nodeWrapper = tree.children[0]
  const labelElement = nodeWrapper.children[1]
  expect(labelElement.props.className).toEqual('petc-node-label')
  const labelText = labelElement.children[0]
  expect(labelText).toEqual('a label')
})

it('should show edge label', () => {
  const props = viewModeProps(BASIC_DOC)
  props.doc.edges['a-b'].label = 'edge label'
  Renderer.create(<Kanvas {...props} />)

  // should call jsplumb to create edge with label
  const connectArgs = mockJsPlumb.connect.mock.calls[0][0]
  expect(connectArgs.overlays).not.toBeNull()
  const labelOverlay = connectArgs.overlays[0]
  expect(labelOverlay[0]).toEqual('Label')
  const label = labelOverlay[1]
  expect(label.label).toEqual('edge label')
})

it('should update edge label after modification', () => {
  const props = editEdgesProps(BASIC_DOC)
  props.doc.edges['a-b'].label = 'label-one'

  const mockConnection = {
    addOverlay: jest.fn(),
    removeOverlay: jest.fn(),
    endpoints: [
      { canvas: document.createElement('div') },
      { canvas: document.createElement('div') }
    ]
  }
  mockJsPlumb.connect.mockReturnValue(mockConnection)

  // should render with first label
  let container = document.createElement('div')
  ReactDOM.render(<Kanvas {...props} />, container)
  let edgeLabel = mockJsPlumb.connect.mock.calls[0][0].overlays[0][1].label
  expect(edgeLabel).toEqual('label-one')

  // should rerender with new label
  props.doc.edges['a-b'].label = 'label-two'
  ReactDOM.render(<Kanvas {...props} />, container)
  edgeLabel = mockConnection.addOverlay.mock.calls[0][0][1].label
  expect(edgeLabel).toEqual('label-two')
})

it('render with nodes and edges with classes', () => {
  const docWithStyle = {
    nodes: {
      'node-a': {id: 'node-a', x: 100, y: 200, className: 'classA'},
      'node-b': {id: 'node-b', x: 200, y: 100, className: 'classB'}
    },
    edges: {
      'a-b': {id: 'a-b', source: 'node-a', target: 'node-b', className: 'edgeClass'}
    },
    style: {
      nodes: {
        'classA': { color: 'red' },
        'classB': { color: 'blue' }
      },
      edges: {
        'edgeClass': { overlays: [ 'Arrow' ] }
      }
    }

  }
  const props = viewModeProps(docWithStyle)
  const component = Renderer.create(<Kanvas {...props} />)
  expect(component.toJSON()).toMatchSnapshot()

  const connectedEdge = getEdge('a-b')
  expect(connectedEdge.source).toEqual('node-a')
  expect(connectedEdge.target).toEqual('node-b')
  expect(connectedEdge.overlays).toEqual([ 'Arrow' ])
  expect(connectedEdge.data).not.toBeNull()
  expect(connectedEdge.data.edgeId).toEqual('a-b')

  const nodeA = getNode(component, 'node-a')
  expect(nodeA.props.className).toEqual('petc-node classA')
  expect(nodeA.props.style).toEqual({ color: 'red' })

  const nodeB = getNode(component, 'node-b')
  expect(nodeB.props.className).toEqual('petc-node classB')
  expect(nodeB.props.style).toEqual({ color: 'blue' })
})

/**
 * Convienience function to create props
 */
function createPropsWithDoc (doc) {
  return {
    doc: doc,
    controls: {
      isNodeMode: false,
      isEdgeMode: false
    },
    addEdge: jest.fn(),
    addNode: jest.fn(),
    draggingNode: jest.fn(),
    removeEdge: jest.fn(),
    removeNode: jest.fn(),
    setEditAttributes: jest.fn(),
    updateNode: jest.fn()
  }
}

/**
 * View mode is the view only mode without any editing
 */
function viewModeProps (doc) {
  return createPropsWithDoc(doc)
}

/**
 * Edit edge mode is the view for editing edges
 */
function editEdgesProps (doc) {
  const props = createPropsWithDoc(doc)
  props.controls.isEdgeMode = true
  return props
}

/**
 * Edit node mode is the view for editing nodes
 */
function editNodesProps (doc) {
  const props = createPropsWithDoc(doc)
  props.controls.isNodeMode = true
  return props
}

/**
 * Get the arguments sent to the jsplumb 'connect' function to create an edge
 */
function getEdge (edgeId) {
  const connectCalls = mockJsPlumb.connect.mock.calls
  const edges = connectCalls
    .map(connectArgs => connectArgs[0])
    .filter(connect => connect.data.edgeId === edgeId)
  if (edges.length !== 1) throw new Error(`Could not find edge '${edgeId}'`)
  expect(edges.length).toEqual(1)
  return edges[0]
}

/**
 * Get the element representing a node
 */
function getNode (component, nodeId) {
  const tree = component.toJSON()
  const nodes = tree.children
    .filter(child => child.children !== null && child.children.length > 0)
    .map(child => child.children[0])
    .filter(node => node.props.id === nodeId)
  if (nodes.length !== 1) throw new Error(`Could not find node '${nodeId}'`)
  return nodes[0]
}

/**
 * Simulate a user clicking on an edge
 */
function clickEdge (edgeId) {
  const bind = mockJsPlumb.bind.mock.calls[1]
  expect(bind[0]).toEqual('click')
  const edgeClickCb = bind[1]
  const connection = { getData: () => ({ edgeId }) }
  const ev = { pageX: 123, pageY: 321 }
  edgeClickCb(connection, ev)
}

/**
 * Simulate a user removing an edge using jsplumbs dragging behaviour
 */
function simulateJsPlumbDetachEdge (edgeId, ev) {
  const bind = mockJsPlumb.bind.mock.calls[0]
  expect(bind[0]).toEqual('connectionDetached')
  const onConnectionDetach = bind[1]
  const connectionInfo = { connection: { getData: () => ({ edgeId }) } }
  onConnectionDetach(connectionInfo, ev)
}
