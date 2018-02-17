/* global expect it */
import React from 'react'
import Renderer from 'react-test-renderer'

import Kanvas from '../Kanvas'

it('render', () => {
  const props = {
    doc: { nodes: [] }
  }
  const component = Renderer.create(<Kanvas {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('render with nodes', () => {
  const props = {
    doc: { nodes: [
      {id: 'a', x: 1, y: 2},
      {id: 'b', x: 2, y: 3}
    ] }
  }
  const component = Renderer.create(<Kanvas {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})
