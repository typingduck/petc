import React from 'react'
import ReactDOM from 'react-dom'
import {MdDelete} from 'react-icons/lib/md'

import './Trashcan.css'

export function isInTrashCan (node) {
  return bounds && withinRect(node, bounds)
}

let bounds = null

class Trashcan extends React.Component {
  componentDidMount () {
    /* eslint-disable react/no-find-dom-node */
    let dom = ReactDOM.findDOMNode(this)
    if (dom) {
      bounds = dom.getBoundingClientRect()
    }
    /* eslint-enable react/no-find-dom-node */
  }

  render () {
    let className = 'hidden'

    if (this.props.controls.isNodeMode) {
      className = ''
      const dragNode = this.props.controls.dragNode
      if (dragNode) {
        if (isInTrashCan(dragNode)) {
          className = 'delete'
        } else {
          className = 'active'
        }
      }
    }
    return (
      <div id='petc-trashcan' className={className}>
        <MdDelete />
      </div>
    )
  }
}

function within (v, a, b) {
  return v >= a && v <= b
}

function withinRect (node, rect) {
  return within(node.x, rect.left, rect.right) &&
      within(node.y, rect.top, rect.bottom)
}

export default Trashcan
