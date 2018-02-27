/* global expect it */
import React from 'react'
import Renderer from 'react-test-renderer'

import BreadCrumbs from '../BreadCrumbs'

it('renders nothing by default', () => {
  const props = {
    controls: {
      isNodeMode: false,
      isEdgeMode: false
    },
    doc: {
      nodes: {},
      edges: {}
    }
  }
  const component = Renderer.create(<BreadCrumbs {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('renders nothing for node-view with nodes', () => {
  const props = {
    controls: {
      isNodeMode: true,
      isEdgeMode: false
    },
    doc: {
      nodes: { node: {} },
      edges: {}
    }
  }
  const component = Renderer.create(<BreadCrumbs {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('renders breadcrumb for edge-view with 1 node', () => {
  const props = {
    controls: {
      isNodeMode: false,
      isEdgeMode: true
    },
    doc: {
      nodes: { node: {} },
      edges: {}
    }
  }
  const component = Renderer.create(<BreadCrumbs {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('renders breadcrumb for edge-view with 2 nodes no edge', () => {
  const props = {
    controls: {
      isNodeMode: false,
      isEdgeMode: true
    },
    doc: {
      nodes: { node1: {}, node2: {} },
      edges: {}
    }
  }
  const component = Renderer.create(<BreadCrumbs {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})

it('renders nothing for edge-view with edges', () => {
  const props = {
    controls: {
      isNodeMode: false,
      isEdgeMode: true
    },
    doc: {
      nodes: { node1: {}, node2: {} },
      edges: { edge: {} }
    }
  }
  const component = Renderer.create(<BreadCrumbs {...props} />)
  expect(component.toJSON()).toMatchSnapshot()
})
