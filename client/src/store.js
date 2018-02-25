import jsonpatch from 'json-patch'
import { connect } from 'react-redux'
import { fromJS } from 'immutable'
import {combineReducers, createStore} from 'redux'

import { initialDoc } from './model/model'
import { ViewMode, viewModeFromHash } from './controls/NavBar'

/**
 * Redux store for the document being edited and the UI state.
 */

/* eslint-disable comma-dangle */

/**
 * Starting state for controls
 */
function initialControls () {
  return {
    storeview: false
  }
}

/**
 * All the events that can happen to the store.
 */
/* eslint-disable key-spacing */
const Events = {
  DOC_LOADED:     Symbol('DOC_LOADED'),

  ADD_NODE:       Symbol('ADD_NODE'),
  ADD_NODE_CLASS: Symbol('ADD_NODE_CLASS'),
  UPDATE_NODE:    Symbol('UPDATE_NODE'),
  DELETE_NODE:    Symbol('DELETE_NODE'),
  ADD_EDGE:       Symbol('ADD_EDGE'),
  DELETE_EDGE:    Symbol('DELETE_EDGE'),
  ADD_EDGE_CLASS: Symbol('ADD_EDGE_CLASS'),
  APPLY_PATCH:    Symbol('APPLY_PATCH'),

  DRAGGING_NODE:     Symbol('DRAGGING_NODE'),
  SELECT_NODE_CLASS: Symbol('SELECT_NODE_CLASS'),
  SELECT_EDGE_CLASS: Symbol('SELECT_EDGE_CLASS'),
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
    case Events.UPDATE_NODE:
      return state.setIn(['nodes', action.node.id], action.node)
    case Events.ADD_NODE_CLASS:
      return state.setIn(['style', 'nodes', action.name], action.style)
    case Events.DELETE_NODE:
      return state.removeIn(['nodes', action.nodeId])
    case Events.ADD_EDGE:
      return state.setIn(['edges', action.edge.id], action.edge)
    case Events.DELETE_EDGE:
      return state.removeIn(['edges', action.edgeId])
    case Events.ADD_EDGE_CLASS:
      return state.setIn(['style', 'edges', action.name], action.style)
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
    case Events.DRAGGING_NODE:
      return state.set('dragNode', action.node)
    case Events.SELECT_NODE_CLASS:
      return state.set('selectedNodeClass', action.clss)
    case Events.SELECT_EDGE_CLASS:
      return state.set('selectedEdgeClass', action.clss)
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
  const controlState = state.controls.toJS()
  controlState.viewMode = viewModeFromHash(ownProps.location.hash)
  controlState.isNodeMode = ViewMode.isNodeMode(controlState.viewMode)
  controlState.isEdgeMode = ViewMode.isEdgeMode(controlState.viewMode)
  return {
    docId: ownProps.match.params.docId,  // set by BrowserRouter in App.
    doc: state.doc.toJS(),
    controls: controlState
  }
}

/**
 * Actions passed as props to the components to emit state change events.
 */
function mapDispatchToProps (dispatch) {
  /* eslint-disable indent */
  /* eslint-disable key-spacing */
  /* eslint-disable no-multi-spaces */
  return {

     docLoaded:   doc => dispatch({ type: Events.DOC_LOADED,    doc }),

       addNode:   node => dispatch({ type: Events.ADD_NODE,     node }),
    updateNode:   node => dispatch({ type: Events.UPDATE_NODE,  node }),
    removeNode: nodeId => dispatch({ type: Events.DELETE_NODE,  nodeId }),
       addEdge:   edge => dispatch({ type: Events.ADD_EDGE,     edge }),
    removeEdge: edgeId => dispatch({ type: Events.DELETE_EDGE,  edgeId }),
    applyPatch:  patch => dispatch({ type: Events.APPLY_PATCH, patch }),

    addEdgeClass: (name, style) => dispatch({ type: Events.ADD_EDGE_CLASS, name, style }),
    addNodeClass: (name, style) => dispatch({ type: Events.ADD_NODE_CLASS, name, style }),

    draggingNode:    node => dispatch({ type: Events.DRAGGING_NODE,     node }),
    selectNodeClass: clss => dispatch({ type: Events.SELECT_NODE_CLASS, clss }),
    selectEdgeClass: clss => dispatch({ type: Events.SELECT_EDGE_CLASS, clss }),

  }
  /* eslint-enable no-multi-spaces */
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
