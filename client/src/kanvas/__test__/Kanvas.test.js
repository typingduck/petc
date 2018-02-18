/* global expect it jest */
import React from 'react'
import Renderer from 'react-test-renderer'
import {initialDoc} from '../../model/model'

import Kanvas from '../Kanvas'

jest.mock('jsplumb', () => ({
  jsPlumb: {
    getInstance: () => ({
      connect: () => null,
      draggable: () => null
    })
  }
}))

it('render', () => {
  const props = {
    doc: initialDoc()
  }
  const component = Renderer.create(<Kanvas {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('render with nodes and edges', () => {
  const props = {
    doc: {
      nodes: {
        'a': {id: 'a', x: 1, y: 2},
        'b': {id: 'b', x: 2, y: 3}
      },
      edges: {
        'a-b': {id: 'a-b', source: 'a', target: 'b'}
      }
    }
  }
  const component = Renderer.create(<Kanvas {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})
