/* global expect it */
import React from 'react'
import Renderer from 'react-test-renderer'

import DocumentPage from './DocumentPage'
import {ViewMode} from './controls/NavBar'

it('matches snapshot', () => {
  const props = {
    docId: '123',
    viewMode: ViewMode.VIEW_GRAPH,
    controls: { storeview: true },
    doc: { nodes: [] }
  }
  const component = Renderer.create(<DocumentPage {...props}/>)
  expect(component.toJSON()).toMatchSnapshot()
})
