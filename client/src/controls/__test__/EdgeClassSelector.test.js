/* global beforeEach expect it jest */
import React from 'react'
import Renderer from 'react-test-renderer'

import EdgeClassSelector from '../EdgeClassSelector'

jest.mock('uuid/v4', () => () => 'u-u-i-d')

const mockJsPlumb = {
  connect: jest.fn()
}

jest.mock('jsplumb', () => (
  { jsPlumb: { getInstance: () => mockJsPlumb } }
))

let props

beforeEach(() => {
  jest.clearAllMocks()
  props = {
    controls: {
      isNodeMode: false,
      isEdgeMode: true,
      selectedEdgeClass: null
    },
    doc: {
      style: {
        edges: {
          'default': {
            anchor: [ 'Left', 'Right' ]
          },
          'red-edge': {
            paintStyle: {
              stroke: 'red'
            }
          },
          'blue-edge': {
            paintStyle: {
              stroke: 'blue'
            }
          }
        }
      }
    },
    addEdge: jest.fn(),
    selectEdgeClass: jest.fn()
  }
})

it('hidden unless edge view mode', () => {
  const props = {
    controls: {
      isEdgeMode: false
    },
    doc: {}
  }
  const component = Renderer.create(<EdgeClassSelector {...props} />)
  expect(component.toJSON()).toBeNull()
})

it('visible when edge view mode', () => {
  const props = {
    controls: {
      isEdgeMode: true
    },
    doc: {}
  }
  const component = Renderer.create(<EdgeClassSelector {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('shows custom edge styles', () => {
  const component = Renderer.create(<EdgeClassSelector {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('highlights selected edge class', () => {
  props.controls.selectedEdgeClass = 'blue-edge'

  const component = Renderer.create(<EdgeClassSelector {...props} />)
  const ul = component.toJSON().children[0]

  const defaultEdge = edgeFromUl(ul, 0)
  expect(defaultEdge.props.className).toBeNull()

  const redEdge = edgeFromUl(ul, 1)
  expect(redEdge.props.className).toBeNull()

  const blueEdge = edgeFromUl(ul, 2)
  expect(blueEdge.props.className).toEqual(expect.stringContaining('selected'))
})

it('click to select edge', () => {
  const component = Renderer.create(<EdgeClassSelector {...props} />)
  const ul = component.toJSON().children[0]

  // drag a edge (only a short distance (so should be a click)
  const redEdge = edgeFromUl(ul, 1)
  simulateClickEdge(redEdge)
  expect(props.selectEdgeClass).toHaveBeenCalledWith('red-edge')
  props.controls.selectedEdgeClass = 'red-edge'

  const blueEdge = edgeFromUl(ul, 2)
  simulateClickEdge(blueEdge)
  expect(props.selectEdgeClass).toHaveBeenCalledWith('blue-edge')
  props.controls.selectedEdgeClass = 'blue-edge'

  // should deselect on second click
  simulateClickEdge(blueEdge)
  expect(props.selectEdgeClass).toHaveBeenCalledWith(null)
})

function edgeFromUl (ul, index) {
  return ul.children[index]
}

function simulateClickEdge (edgeLi) {
  edgeLi.props.onClick()
}
