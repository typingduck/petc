/* global expect it jest */
import React from 'react'
import Renderer from 'react-test-renderer'

import Trashcan from '../Trashcan'

jest.mock('react-dom', () => ({
  findDOMNode: () => ({
    getBoundingClientRect: () => ({
      left: 10,
      right: 20,
      top: 100,
      bottom: 110
    })
  })
}))

it('hidden when not editing nodes', () => {
  const props = {
    controls: {
      isNodeMode: false,
      dragNode: { id: 'id', x: 15, y: 105 }
    }
  }
  const component = Renderer.create(<Trashcan {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('visible when editing nodes', () => {
  const props = {
    controls: {
      isNodeMode: true,
      dragNode: null
    }
  }
  const component = Renderer.create(<Trashcan {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('active when editing nodes and have dragging node', () => {
  const props = {
    controls: {
      isNodeMode: true,
      dragNode: { id: 'id', x: 1, y: 1 }
    }
  }
  const component = Renderer.create(<Trashcan {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('red when node inside trashcan', () => {
  const props = {
    controls: {
      isNodeMode: true,
      dragNode: { id: 'id', x: 15, y: 105 }
    }
  }
  const component = Renderer.create(<Trashcan {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})
