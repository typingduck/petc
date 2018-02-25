/* global beforeEach expect it jest */
import React from 'react'
import Renderer from 'react-test-renderer'

import {initialDoc} from '../../model/model'
import Kanvas from '../Kanvas'

jest.useFakeTimers()

Math.random = () => 0.1

const mockJsPlumb = {
  connect: jest.fn(),
  draggable: jest.fn(),
  repaint: jest.fn(),
  setDraggable: jest.fn(),
  bind: jest.fn(),
  importDefaults: jest.fn()
}

jest.mock('jsplumb', () => (
  { jsPlumb: { getInstance: () => mockJsPlumb } }
))

let mockIsInTrashCan = false

jest.mock('../../controls/Trashcan', () => (
  { isInTrashCan: jest.fn(() => mockIsInTrashCan) }
))

jest.mock('uuid/v4', () => () => 'u-u-i-d')

beforeEach(() => {
  jest.clearAllMocks()
})

it('renders initial doc', () => {
  const props = {
    doc: initialDoc(),
    controls: {
      isNodeMode: false,
      isEdgeMode: false
    }
  }
  const component = Renderer.create(<Kanvas {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('render with nodes and edges', () => {
  const props = {
    doc: {
      nodes: {
        'a': {id: 'a', x: 1, y: 2},
        'b': {id: 'b', x: 2, y: 3}
      },
      edges: {
        'a-b': {id: 'a-b', source: 'a', target: 'b'}
      }
    },
    controls: {
      isNodeMode: false,
      isEdgeMode: false
    }
  }
  const component = Renderer.create(<Kanvas {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('should create node on click', () => {
  const props = {
    doc: {
      nodes: {},
      edges: {}
    },
    controls: {
      isNodeMode: true,
      isEdgeMode: false
    },
    addNode: jest.fn()
  }
  const component = Renderer.create(<Kanvas {...props} />)
  const tree = component.toJSON()

  tree.props.onClick({ pageX: 125, pageY: 225 })

  expect(props.addNode).toHaveBeenCalledWith({ id: 'u-u-i-d', x: 100, y: 200 })
})

it('should select node in edge mode', () => {
  const props = {
    doc: {
      nodes: {
        'node': { id: 'node', x: 100, y: 100 }
      },
      edges: {}
    },
    controls: {
      isNodeMode: false,
      isEdgeMode: true
    },
    addNode: jest.fn()
  }
  // given kanvas with a node
  const component = Renderer.create(<Kanvas {...props} />)
  let tree = component.toJSON()
  let nodeDiv = tree.children[0].children[0]
  expect(nodeDiv.props.id).toEqual('node')
  expect(nodeDiv.props.className).toEqual('petc-node')

  // when clicking on node
  nodeDiv.props.onClick({ stopPropagation: () => null })

  // should mark node as selected
  tree = component.toJSON()
  nodeDiv = tree.children[0].children[0]
  expect(nodeDiv.props.className).toEqual('petc-node petc-node-selected')

  // when clicking on kanvas
  tree.props.onClick()
  tree = component.toJSON()
  nodeDiv = tree.children[0]

  // should deselect node
  tree = component.toJSON()
  nodeDiv = tree.children[0].children[0]
  expect(nodeDiv.props.className).toEqual('petc-node')
})

it('should disable dragging in edge view mode', () => {
  const props = {
    doc: {
      nodes: {
        'node': { id: 'node', x: 100, y: 100 }
      },
      edges: {}
    },
    controls: {
      isNodeMode: false,
      isEdgeMode: true
    },
    addNode: jest.fn()
  }
  // given kanvas with a node in edge mode
  const component = Renderer.create(<Kanvas {...props} />)
  let tree = component.toJSON()
  let nodeDiv = tree.children[0]
  expect(nodeDiv.props.id).toEqual('node-wrapper')

  // then dragging should be disabled
  const setDraggable = mockJsPlumb.setDraggable.mock.calls[0]
  expect(setDraggable).toEqual([ 'node-wrapper', false ])
})

it('should enable dragging in node view mode', () => {
  const props = {
    doc: {
      nodes: {
        'node': { id: 'node', x: 100, y: 100 }
      },
      edges: {}
    },
    controls: {
      isNodeMode: true,
      isEdgeMode: false
    },
    addNode: jest.fn()
  }
  // given kanvas with a node in edge mode
  const component = Renderer.create(<Kanvas {...props} />)
  let tree = component.toJSON()
  let nodeDiv = tree.children[0]
  expect(nodeDiv.props.id).toEqual('node-wrapper')

  // then dragging should be disabled
  const setDraggable = mockJsPlumb.setDraggable.mock.calls[0]
  expect(setDraggable).toEqual([ 'node-wrapper', true ])
})

it('should emit node position after dragging', () => {
  const props = {
    doc: {
      nodes: {
        'node': { id: 'node', x: 10, y: 20 }
      },
      edges: {}
    },
    controls: {
      isNodeMode: false,
      isEdgeMode: true
    },
    draggingNode: jest.fn(),
    updateNode: jest.fn()
  }
  // given kanvas with a node
  const component = Renderer.create(<Kanvas {...props} />)
  let tree = component.toJSON()
  let nodeDiv = tree.children[0]
  expect(nodeDiv.props.id).toEqual('node-wrapper')

  // given jsPlumb dragging setup
  const draggable = mockJsPlumb.draggable.mock.calls[0]
  expect(draggable[0]).toEqual('node-wrapper')
  const onDrag = draggable[1].drag
  const onDragStart = draggable[1].start
  const onDragStop = draggable[1].stop

  // when dragging node
  onDragStart()

  onDrag({ e: { pageX: 100, pageY: 200 } })
  expect(props.draggingNode).toHaveBeenCalledWith({ id: 'node', x: 100, y: 200 })

  onDragStop({ finalPos: [1000, 2000] })
  expect(props.draggingNode).toHaveBeenCalledWith(null)

  // should emit node position at end
  expect(props.updateNode).toHaveBeenCalledWith({ id: 'node', x: 1000, y: 2000 })
})

it('should delete node if in trashcan', () => {
  const props = {
    doc: {
      nodes: {
        'node-id': { id: 'node-id', x: 10, y: 20 }
      },
      edges: {}
    },
    controls: {
      isNodeMode: false,
      isEdgeMode: true
    },
    draggingNode: jest.fn(),
    updateNode: jest.fn(),
    removeNode: jest.fn()
  }
  // given kanvas with a node
  const component = Renderer.create(<Kanvas {...props} />)
  let tree = component.toJSON()
  let nodeDiv = tree.children[0]
  expect(nodeDiv.props.id).toEqual('node-id-wrapper')

  // given jsPlumb dragging setup
  const draggable = mockJsPlumb.draggable.mock.calls[0]
  expect(draggable[0]).toEqual('node-id-wrapper')
  const onDrag = draggable[1].drag
  const onDragStart = draggable[1].start
  const onDragStop = draggable[1].stop

  // when dragging node
  onDragStart()
  onDrag({ e: { pageX: 100, pageY: 200 } })

  mockIsInTrashCan = true
  onDragStop({ finalPos: [1000, 2000] })

  // should emit delete node
  expect(props.removeNode).toHaveBeenCalledWith('node-id')
})

it('should show node label', () => {
  const props = {
    doc: {
      nodes: {
        'node': { id: 'node', x: 10, y: 20, label: 'a label' }
      },
      edges: {}
    },
    controls: {
      isNodeMode: false,
      isEdgeMode: true
    }
  }
  // given kanvas with a node
  const component = Renderer.create(<Kanvas {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})
