/* global expect it */
import React from 'react'
import Renderer from 'react-test-renderer'

import HomePage from './HomePage'

it('renders without crashing', () => {
  Renderer.create(<HomePage />)
})

it('matches snapshot', () => {
  const component = Renderer.create(<HomePage />)
  expect(component.toJSON()).toMatchSnapshot()
})
