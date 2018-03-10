/* global beforeEach expect it jest */
import React from 'react'
import Renderer from 'react-test-renderer'

import AttributeEditor from '../AttributeEditor'

const props = {}

const nodeProps = {
  doc: {
    nodes: {
      'anode': { id: 'anode', className: 'node style a' }
    },
    edges: {
      'anedge': { id: 'anedge', className: 'edge style a' }
    },
    style: {
      nodes: {
        'node style a': {},
        'node style b': {}
      },
      edges: {
        'edge style a': {},
        'edge style b': {}
      }
    }
  },
  controls: {
    editAttributes: { id: 'anode', pageX: 95, pageY: 95 }
  },
  setEditAttributes: jest.fn(),
  updateNode: jest.fn(),
  updateEdge: jest.fn()
}

beforeEach(() => {
  jest.clearAllMocks()
})

it('hides attribute editor by default', () => {
  const component = Renderer.create(<AttributeEditor {...props} />)
  expect(component.toJSON()).toBeNull()
})

it('renders attribute editor for node', () => {
  const component = Renderer.create(<AttributeEditor {...props} />)
  component.getInstance().componentWillReceiveProps(nodeProps)
  expect(component.toJSON()).not.toBeNull()
  expect(component.toJSON()).toMatchSnapshot()
})

it('calls reset edit attributes element on cancel', () => {
  const component = Renderer.create(<AttributeEditor {...nodeProps} />)
  component.getInstance().componentWillReceiveProps(nodeProps)

  const cancelButton = component.root.findAllByType('button')[1]
  cancelButton.props.onClick()
  expect(nodeProps.setEditAttributes).toHaveBeenCalledWith(null)
})

it('fills label on apply button press', () => {
  const component = Renderer.create(<AttributeEditor {...nodeProps} />)
  component.getInstance().componentWillReceiveProps(nodeProps)

  fillLabelInput(component, 'new label')

  const applyButton = component.root.findAllByType('button')[0]
  applyButton.props.onClick()

  expect(nodeProps.updateNode).toHaveBeenCalledWith({
    id: 'anode', label: 'new label', className: 'node style a'
  })
})

it('fills class on apply button press', () => {
  const component = Renderer.create(<AttributeEditor {...nodeProps} />)
  component.getInstance().componentWillReceiveProps(nodeProps)

  fillClassInput(component, 'style b')

  const applyButton = component.root.findAllByType('button')[0]
  applyButton.props.onClick()

  expect(nodeProps.updateNode).toHaveBeenCalledWith({
    id: 'anode', label: '', className: 'style b'
  })
})

const edgeProps = Object.assign({}, nodeProps,
  { controls: { editAttributes: { id: 'anedge', pageX: 95, pageY: 95 } } }
)

it('renders attribute editor for edge', () => {
  const component = Renderer.create(<AttributeEditor {...props} />)
  component.getInstance().componentWillReceiveProps(edgeProps)
  expect(component.toJSON()).not.toBeNull()
  expect(component.toJSON()).toMatchSnapshot()
})

it('updates edge on apply', () => {
  const component = Renderer.create(<AttributeEditor {...edgeProps} />)
  component.getInstance().componentWillReceiveProps(edgeProps)

  fillLabelInput(component, 'new edge label')
  fillClassInput(component, 'edge style b')

  const applyButton = component.root.findAllByType('button')[0]
  applyButton.props.onClick()

  expect(nodeProps.updateEdge).toHaveBeenCalledWith({
    id: 'anedge', label: 'new edge label', className: 'edge style b'
  })
})

function fillLabelInput (component, value) {
  const labelField = component.root.findByType('input')
  labelField.props.onChange({ target: { value } })
}

function fillClassInput (component, value) {
  const classField = component.root.findByType('select')
  classField.props.onChange({ target: { value } })
}
