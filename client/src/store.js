import jsonpatch from 'json-patch'
import { connect } from 'react-redux'
import { fromJS } from 'immutable'
import {combineReducers, createStore} from 'redux'

import { initialDoc } from './model/model.js'

/**
 * Redux store for the document being edited and the UI state.
 */

/* eslint-disable comma-dangle */

/**
 * All the events that can happen to the store.
 */
const Events = {
  DOC_LOADED: Symbol('DOC_LOADED'),
  ADD_NODE: Symbol('ADD_NODE'),
  APPLY_PATCH: Symbol('APPLY_PATCH'),
}

/**
 * State change for the 'doc' document part of the app state.
 */
function docReducer (state, action) {
  if (typeof state === 'undefined') {
    return fromJS(initialDoc())
  }
  switch (action.type) {
    case Events.DOC_LOADED:
      return fromJS(action.doc)
    case Events.ADD_NODE:
      return state.update('nodes', n => n.push(action.node))
    case Events.APPLY_PATCH:
      const doc = state.toJS()
      jsonpatch.apply(doc, action.patch)
      return fromJS(doc)
  }
  return state
}

/**
 * State change for the UI part of the app state.
 */
function controlsReducer (state, action) {
  if (typeof state === 'undefined') {
    return fromJS({})
  }
  return state
}


/**
 * Combine all reduces into a single global one.
 */
const rootReducer = combineReducers({
  doc: docReducer,
  controls: controlsReducer
})

/**
 * The redux store for use in by a Provider
 */
export const store = createStore(rootReducer)


/**
 * Maps what gets passed as props to the compoents.
 */
const mapStateToProps = (state, ownProps) => {
  return {
    doc: state.doc.toJS(),
    controls: state.controls.toJS()
  }
}

/**
 * Functions passed as props to the components for them to use to emit
 * state update events.
 */
const mapDispatchToProps = dispatch => {
  /* eslint-disable indent */
  /* eslint-disable key-spacing */
  return {
     docLoaded:   doc => dispatch({ type: Events.DOC_LOADED, doc }),
       addNode:  node => dispatch({ type: Events.ADD_NODE, node }),
    applyPatch: patch => dispatch({ type: Events.APPLY_PATCH, patch }),
  }
  /* eslint-enable key-spacing */
  /* eslint-enable indent */
}

/**
 * Wrap a react component so that it has the redux state/methods above.
 */
export function connectStore (component) {
  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(component)
}
