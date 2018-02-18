/* global expect it */
import React from 'react'
import Renderer from 'react-test-renderer'

import {default as NavBar, ViewMode} from '../NavBar'

it('renders view mode', () => {
  const props = {
    controls: { viewMode: ViewMode.VIEW_GRAPH }
  }
  const component = Renderer.create(<NavBar {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('renders pan and zoom mode', () => {
  const props = {
    controls: { viewMode: ViewMode.PAN_N_ZOOM }
  }
  const component = Renderer.create(<NavBar {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('renders edit nodes mode', () => {
  const props = {
    controls: { viewMode: ViewMode.EDIT_NODES }
  }
  const component = Renderer.create(<NavBar {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('renders edit edges mode', () => {
  const props = {
    controls: { viewMode: ViewMode.EDIT_EDGES }
  }
  const component = Renderer.create(<NavBar {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})
