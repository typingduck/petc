/* global expect it jest */
import React from 'react'
import Renderer from 'react-test-renderer'

import App from '../App'

jest.mock('../model/model', () => ({
  initialDoc: () => ({ nodes: {}, edges: {} }),
  loadDoc: () => Promise.resolve({ nodes: {}, edges: {} }),
  connectSocket: () => Promise.resolve()
}))

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

it('renders document page', () => {
  window.history.replaceState(null, null, '/docs/doc-id#node')
  const component = Renderer.create(<App />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('renders homepage', () => {
  window.history.replaceState(null, null, '/')
  const component = Renderer.create(<App />)
  expect(component.toJSON()).toMatchSnapshot()
})
