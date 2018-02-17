/* global expect it */
import React from 'react'
import Renderer from 'react-test-renderer'

import App from './App'


it('renders homepage', () => {
  const component = Renderer.create(<App />)
  expect(component.toJSON()).toMatchSnapshot()
})
