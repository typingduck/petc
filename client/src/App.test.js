/* global expect it */
import React from 'react'
import Renderer from 'react-test-renderer'
import {MemoryRouter} from 'react-router-dom'

import App from './App'

it('renders homepage', () => {
  const component = Renderer.create(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  )
  expect(component.toJSON()).toMatchSnapshot()
})

it('renders doc', () => {
  const component = Renderer.create(
    <MemoryRouter initialEntries={['/docs/123']}>
      <App />
    </MemoryRouter>
  )
  expect(component.toJSON()).toMatchSnapshot()
})
