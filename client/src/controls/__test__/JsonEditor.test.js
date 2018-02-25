/* global expect it jest */
import React from 'react'
import Renderer from 'react-test-renderer'

import JsonEditor from '../JsonEditor'

const props = {
  isOpen: true,
  json: {
    'a': 1,
    'b': [1, 2, 3],
    'c': {
      'd': 'dv',
      'e': 'ev'
    }
  },
  onApply: jest.fn(),
  onCancel: jest.fn()
}

it('renders jsonview', () => {
  const component = Renderer.create(<JsonEditor {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('calls cancel on cancel button press', () => {
  const component = Renderer.create(<JsonEditor {...props} />)
  const cancelButton = component.root.findAllByType('button')[1]
  cancelButton.props.onClick()
  expect(props.onCancel).toHaveBeenCalled()
})

it('should not allow apply without name', () => {
  const component = Renderer.create(<JsonEditor {...props} />)
  const nameField = component.root.findByType('input')
  expect(nameField.props.style).toBeNull()

  const applyButton = component.root.findAllByType('button')[0]
  applyButton.props.onClick()
  expect(props.onApply).not.toHaveBeenCalled()

  expect(nameField.props.style).toEqual({ 'borderColor': 'red' })
})

it('calls apply on apply button press', () => {
  const component = Renderer.create(<JsonEditor {...props} />)
  const applyButton = component.root.findAllByType('button')[0]
  fillNameInput(component, 'name')
  applyButton.props.onClick()
  expect(props.onApply).toHaveBeenCalledWith('name', props.json)
})

it('calls apply with updated doc', () => {
  const component = Renderer.create(<JsonEditor {...props} />)
  fillNameInput(component, 'foo')
  const updated = { 'a': 1 }
  component.getInstance().update({ updated_src: updated })
  const applyButton = component.root.findAllByType('button')[0]
  applyButton.props.onClick()
  expect(props.onApply).toHaveBeenCalledWith('foo', updated)
})

function fillNameInput (component, value) {
  const nameField = component.root.findByType('input')
  nameField.props.onChange({ target: { value } })
}
