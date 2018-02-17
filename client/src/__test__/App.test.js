/* global expect it jest */
import React from 'react'
import Renderer from 'react-test-renderer'

import App from '../App'

jest.mock('../model/model', () => ({
  initialDoc: () => ({ nodes: [] }),
  loadDoc: () => Promise.resolve({ nodes: [] }),
  connectSocket: () => Promise.resolve()
}))

it('renders document page', () => {
  window.history.replaceState(null, null, '/docs/doc-id')
  const component = Renderer.create(<App />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('renders homepage', () => {
  window.history.replaceState(null, null, '/')
  const component = Renderer.create(<App />)
  expect(component.toJSON()).toMatchSnapshot()
})
