/* global expect it */
import React from 'react'
import Renderer from 'react-test-renderer'
import {MemoryRouter} from 'react-router-dom'

import HomePage from './HomePage'

it('matches snapshot', () => {
  const component = Renderer.create(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  )
  expect(component.toJSON()).toMatchSnapshot()
})
