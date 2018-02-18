/* global expect it jest */
import React from 'react'
import ShallowRenderer from 'react-test-renderer/shallow'

import DocumentPage from '../DocumentPage'
import {ViewMode} from '../controls/NavBar'

jest.mock('../model/model', () => ({
  initialDoc: () => ({ nodes: {}, edges: {} }),
  loadDoc: () => Promise.resolve({ nodes: {}, edges: {} }),
  connectSocket: () => Promise.resolve()
}))

it('matches snapshot', () => {
  const props = {
    docId: '123',
    viewMode: ViewMode.VIEW_GRAPH,
    controls: { storeview: true },
    doc: { nodes: {}, edges: {} },
    docLoaded: () => {}
  }
  const renderer = new ShallowRenderer()
  const result = renderer.render(<DocumentPage {...props} />)
  expect(result).toMatchSnapshot()
})
