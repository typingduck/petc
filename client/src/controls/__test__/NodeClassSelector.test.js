/* global beforeEach expect it jest */
import React from 'react'
import Renderer from 'react-test-renderer'

import JsonEditor from '../JsonEditor'
import NodeClassSelector from '../NodeClassSelector'

jest.mock('uuid/v4', () => () => 'u-u-i-d')

let props

beforeEach(() => {
  props = {
    controls: {
      isNodeMode: true,
      isEdgeMode: false,
      selectedNodeClass: null
    },
    doc: {
      style: {
        nodes: {
          'class-red': {
            color: 'red'
          },
          'class-blue': {
            color: 'blue'
          }
        }
      }
    },
    addNode: jest.fn(),
    selectNodeClass: jest.fn(),
    addNodeClass: jest.fn()
  }
})

it('hidden unless node view mode', () => {
  const props = {
    controls: {
      isNodeMode: false
    },
    doc: {}
  }
  const component = Renderer.create(<NodeClassSelector {...props} />)
  expect(component.toJSON()).toBeNull()
})

it('visible when node view mode', () => {
  const props = {
    controls: {
      isNodeMode: true
    },
    doc: {}
  }
  const component = Renderer.create(<NodeClassSelector {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('shows custom node styles', () => {
  const component = Renderer.create(<NodeClassSelector {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('highlights selected class', () => {
  props.controls.selectedNodeClass = 'class-blue'

  const component = Renderer.create(<NodeClassSelector {...props} />)
  const ul = component.toJSON().children[0]

  const defaultNode = nodeFromUl(ul, 0)
  expect(defaultNode.props.className).toBeNull()

  const redNode = nodeFromUl(ul, 1)
  expect(redNode.props.className).toBeNull()

  const blueNode = nodeFromUl(ul, 2)
  expect(blueNode.props.className).toEqual(expect.stringContaining('active'))
})

it('click to select node', () => {
  const component = Renderer.create(<NodeClassSelector {...props} />)
  const ul = component.toJSON().children[0]

  // drag a node (only a short distance (so should be a click)
  const redNode = nodeFromUl(ul, 1)
  simulateClickNode(component, redNode)
  expect(props.selectNodeClass).toHaveBeenCalledWith('class-red')
  props.controls.selectedNodeClass = 'class-red'

  const blueNode = nodeFromUl(ul, 2)
  simulateClickNode(component, blueNode)
  expect(props.selectNodeClass).toHaveBeenCalledWith('class-blue')
  props.controls.selectedNodeClass = 'class-blue'

  // should deselect on second click
  simulateClickNode(component, blueNode)
  expect(props.selectNodeClass).toHaveBeenCalledWith(null)
})

it('drag to add node', () => {
  const component = Renderer.create(<NodeClassSelector {...props} />)
  const ul = component.toJSON().children[0]

  // drag a node onto kanvas
  const redNode = nodeFromUl(ul, 1)
  simulateDragNode(component, redNode, 100, 100)
  expect(props.addNode).toHaveBeenCalledWith(
    {'className': 'class-red', 'id': 'u-u-i-d', 'x': 30, 'y': 30}
  )
})

it('click to show new node class editor', () => {
  const component = Renderer.create(<NodeClassSelector {...props} />)
  const ul = component.toJSON().children[0]

  // click new button
  const newNodeClass = nodeFromUl(ul, 3)
  newNodeClass.props.onClick()
  expect(component.toJSON()).toMatchSnapshot()

  // click again to hide
  newNodeClass.props.onClick()
  expect(component.toJSON()).toMatchSnapshot()
})

it('create new node class from dialog', () => {
  const component = Renderer.create(<NodeClassSelector {...props} />)
  const ul = component.toJSON().children[0]

  // click to show dialog
  const newNodeClass = nodeFromUl(ul, 3)
  newNodeClass.props.onClick()

  const editor = component.root.findByType(JsonEditor)
  editor.props.onApply('name', { 'color': 'red' })
  expect(props.addNodeClass).toHaveBeenCalledWith('name', { 'color': 'red' })
})

function nodeFromUl (ul, index) {
  return ul.children[index]
}

function simulateClickNode (component, nodeLi) {
  simulateDragNode(component, nodeLi, 0, 0)
}

function simulateDragNode (component, nodeLi, dx, dy) {
  nodeLi.props.onMouseDown()
  const node = nodeLi.children[0]
  component.getInstance().dragHandleStop(
    { target: { style: {} }, pageX: dx, pageY: dy, offsetX: 50, offsetY: 50 },
    { node: { classList: node.props.className.split(' ') }, x: dx, y: dy }
  )
  nodeLi.props.onMouseUp()
}
