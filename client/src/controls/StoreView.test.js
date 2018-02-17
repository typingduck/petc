/* global expect it */
import React from 'react'
import Renderer from 'react-test-renderer'

import StoreView from './StoreView'

it('renders storeview', () => {
  const props = {
    controls: { storeview: true },
    docs: { a: 1 }
  }
  const component = Renderer.create(<StoreView {...props}/>)
  expect(component.toJSON()).toMatchSnapshot()
})

it('hides storeview when not debugging', () => {
  const props = {
    controls: { storeview: false },
    docs: { a: 1 }
  }
  const component = Renderer.create(<StoreView {...props}/>)
  expect(component.toJSON()).toBeNull()
})
