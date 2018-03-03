/* global expect it global jest */
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

const mockJsPlumb = {
  connect: jest.fn(),
  bind: jest.fn(),
  importDefaults: jest.fn()
}

global.jsPlumb = {
  getInstance: () => mockJsPlumb
}

it('renders document page', () => {
  window.history.replaceState(null, null, '/docs/doc-id')
  const component = Renderer.create(<App />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('renders document page #node', () => {
  window.history.replaceState(null, null, '/docs/doc-id#node')
  const component = Renderer.create(<App />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('renders document page #edge', () => {
  window.history.replaceState(null, null, '/docs/doc-id#edge')
  const component = Renderer.create(<App />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('renders homepage', () => {
  window.history.replaceState(null, null, '/')
  const component = Renderer.create(<App />)
  expect(component.toJSON()).toMatchSnapshot()
})
