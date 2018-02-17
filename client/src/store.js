import jsonpatch from 'json-patch'
import { connect } from 'react-redux'
import { fromJS } from 'immutable'
import {combineReducers, createStore} from 'redux'

import { initialDoc } from './model/model'
import { viewModeFromHash } from './controls/NavBar'

/**
 * Redux store for the document being edited and the UI state.
 */

/* eslint-disable comma-dangle */

/**
 * Starting state for controls
 */
function initialControls () {
  return {
    storeview: true
  }
}

/**
 * All the events that can happen to the store.
 */
/* eslint-disable key-spacing */
const Events = {
  DOC_LOADED:  Symbol('DOC_LOADED'),
  ADD_NODE:    Symbol('ADD_NODE'),
  APPLY_PATCH: Symbol('APPLY_PATCH'),
}
/* eslint-enable key-spacing */

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
    case Events.APPLY_PATCH: {
      const doc = state.toJS()
      jsonpatch.apply(doc, action.patch)
      return fromJS(doc)
    }
    default:
      return state
  }
}

/**
 * State change for the 'controls' UI part of the app state.
 */
function controlsReducer (state, action) {
  if (typeof state === 'undefined') {
    return fromJS(initialControls())
  }
  switch (action.type) {
    default:
      return state
  }
}

/**
 * Combine all reducers into a single global one.
 */
const rootReducer = combineReducers({
  doc: docReducer,
  controls: controlsReducer
})

/**
 * The redux store for use by a redux Provider.
 */
export const store = createStore(rootReducer)

/**
 * Sets what gets passed as props to the component wrapped with connectStore.
 */
function mapStateToProps (state, ownProps) {
  return {
    docId: ownProps.match.params.docId,  // set by BrowserRouter in App.
    viewMode: viewModeFromHash(ownProps.location.hash),
    doc: state.doc.toJS(),
    controls: state.controls.toJS()
  }
}

/**
 * Actions passed as props to the components to emit state change events.
 */
function mapDispatchToProps (dispatch) {
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
 * Wrap a react component so that it has the above state/actions as props.
 */
export function connectStore (component) {
  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(component)
}
