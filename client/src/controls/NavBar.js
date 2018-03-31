import React from 'react'
import {MdRemoveRedEye, MdDeviceHub, MdShuffle, MdCreateNewFolder} from 'react-icons/lib/md'
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

ViewMode.isEdgeMode = function (viewMode) {
  return viewMode === ViewMode.EDIT_EDGES
}

ViewMode.isNodeMode = function (viewMode) {
  return viewMode === ViewMode.EDIT_NODES
}

const VIEW_BUTTONS = [
  [ViewMode.VIEW_GRAPH, 'petc-vmc-view', '#view', MdRemoveRedEye],
  [ViewMode.EDIT_NODES, 'petc-vmc-node', '#node', MdDeviceHub],
  [ViewMode.EDIT_EDGES, 'petc-vmc-edge', '#edge', MdShuffle],
  // [ViewMode.PAN_N_ZOOM, 'petc-vmc-zpan', '#zpan', MdGames],
  [ViewMode.CREATE_NEW, 'petc-vmc-demo', '/', MdCreateNewFolder]
]

const BUTTON_TITLES = {
  'petc-vmc-view': 'view only',
  'petc-vmc-node': 'edit nodes',
  'petc-vmc-edge': 'edit edges',
  'petc-vmc-zpan': 'pan and zoom',
  'petc-vmc-demo': 'home'
}

function buttonTitle (button) {
  return BUTTON_TITLES[button]
}

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
    return mode === this.props.controls.viewMode ? 'active' : ''
  }

  render () {
    const buttons = VIEW_BUTTONS.map(([mode, buttonId, href, icon]) =>
      <li key={mode.toString()} className={this.getClass(mode)}>
        <a id={buttonId} title={buttonTitle(buttonId)} href={href}>{React.createElement(icon)}</a>
      </li>
    )
    return (
      <div id='petc-view-mode-control' className='petc-controls'>
        <ul> {buttons} </ul>
      </div>
    )
  }
}
