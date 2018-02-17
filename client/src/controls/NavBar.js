import React from 'react'
import {MdRemoveRedEye, MdGames, MdDeviceHub, MdShuffle, MdCreateNewFolder} from 'react-icons/lib/md'
import {Enum} from 'enumify'
import './NavBar.css'

export class ViewMode extends Enum {
  toJSON () {
    return this.name
  }
}

ViewMode.initEnum([
  'VIEW_GRAPH',
  'PAN_N_ZOOM',
  'EDIT_NODES',
  'EDIT_EDGES',
  'CREATE_NEW'
])

ViewMode.isEdgeMode = function (state) {
  return state.viewMode === ViewMode.EDIT_EDGES
}

ViewMode.isNodeMode = function (state) {
  return state.viewMode === ViewMode.EDIT_NODES
}

const VIEW_BUTTONS = [
  [ViewMode.VIEW_GRAPH, 'petc-vmc-view', '#view', MdRemoveRedEye],
  [ViewMode.PAN_N_ZOOM, 'petc-vmc-zpan', '#zpan', MdGames],
  [ViewMode.EDIT_NODES, 'petc-vmc-node', '#node', MdDeviceHub],
  [ViewMode.EDIT_EDGES, 'petc-vmc-edge', '#edge', MdShuffle],
  [ViewMode.CREATE_NEW, 'petc-vmc-demo', '/', MdCreateNewFolder]
]

export function viewModeFromHash (locationHash) {
  switch (locationHash) {
    case '#edge':
      return ViewMode.EDIT_EDGES
    case '#node':
      return ViewMode.EDIT_NODES
    case '#zpan':
      return ViewMode.PAN_N_ZOOM
    default:
      return ViewMode.VIEW_GRAPH
  }
}

export default class NavBar extends React.Component {
  getClass (mode) {
    return mode === this.props.viewMode ? 'active' : ''
  }

  render () {
    const buttons = VIEW_BUTTONS.map(([mode, buttonId, href, icon]) =>
      <li key={mode.toString()} className={this.getClass(mode)}>
        <a id={buttonId} href={href}>{React.createElement(icon)}</a>
      </li>
    )
    return (
      <div id='petc-view-mode-control'>
        <ul> {buttons} </ul>
      </div>
    )
  }
}
