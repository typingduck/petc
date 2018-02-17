/* global expect it */
import React from 'react'
import Renderer from 'react-test-renderer'

import NavBar from './NavBar'
import {ViewMode} from './NavBar'

it('renders view', () => {
  const props = {
    controls: { viewMode: ViewMode.VIEW_GRAPH }
  }
  const component = Renderer.create(<NavBar {...props}/>)
  expect(component.toJSON()).toMatchSnapshot()
})

it('renders pan and zoom', () => {
  const props = {
    controls: { viewMode: ViewMode.PAN_N_ZOOM }
  }
  const component = Renderer.create(<NavBar {...props}/>)
  expect(component.toJSON()).toMatchSnapshot()
})

it('renders edit nodes', () => {
  const props = {
    controls: { viewMode: ViewMode.EDIT_NODES }
  }
  const component = Renderer.create(<NavBar {...props}/>)
  expect(component.toJSON()).toMatchSnapshot()
})

it('renders edit edges', () => {
  const props = {
    controls: { viewMode: ViewMode.EDIT_EDGES }
  }
  const component = Renderer.create(<NavBar {...props}/>)
  expect(component.toJSON()).toMatchSnapshot()
})
