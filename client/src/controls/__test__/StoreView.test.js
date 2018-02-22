/* global expect it */
import React from 'react'
import Renderer from 'react-test-renderer'

import StoreView from '../StoreView'

it('renders storeview', () => {
  const props = {
    docId: '123',
    controls: {
      storeview: true,
      isNodeMode: true
    },
    doc: { a: 1 }
  }
  const component = Renderer.create(<StoreView {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('hides storeview when not debugging', () => {
  const props = {
    controls: { storeview: false },
    docs: { a: 1 }
  }
  const component = Renderer.create(<StoreView {...props} />)
  expect(component.toJSON()).toBeNull()
})
