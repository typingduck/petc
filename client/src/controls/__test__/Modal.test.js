/* global expect it jest */
import React from 'react'
import Renderer from 'react-test-renderer'

import Modal from '../Modal'

const props = {
  isOpen: true,
  className: 'custom-clss',
  onRequestClose: jest.fn()
}

it('renders modal', () => {
  const component = Renderer.create(
    <Modal {...props} >
      <div id='inner' />
    </Modal>
  )
  expect(component.toJSON()).toMatchSnapshot()
})

it('hides modal when not debugging', () => {
  const component = Renderer.create(<Modal isOpen={false} />)
  expect(component.toJSON()).toBeNull()
})

it('click overlay to hide', () => {
  const component = Renderer.create(<Modal {...props} />)
  const overlay = component.toJSON()
  overlay.props.onClick()
  expect(props.onRequestClose).toHaveBeenCalled()
})

it('click modal should not hide', () => {
  const component = Renderer.create(<Modal {...props} />)
  const modal = component.toJSON().children[0]
  const stopProp = jest.fn()
  modal.props.onClick({ stopPropagation: stopProp })
  expect(stopProp).toHaveBeenCalled()
})
