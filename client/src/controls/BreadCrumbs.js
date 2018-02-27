import React from 'react'
import './BreadCrumbs.css'

/**
 * A useful development tool for viewing the redux state in the browser.
 * Hidden during normal viewing.
 */
export default function BreadCrumbs (props) {
  let msg = null

  if (props.controls.isNodeMode && Object.keys(props.doc.nodes).length === 0) {
    msg = <p> click on the canvas <br /> to create nodes </p>
  } else if (props.controls.isEdgeMode && Object.keys(props.doc.nodes).length < 2) {
    msg = <p> use the node view <br /> to create 2 or more nodes </p>
  } else if (props.controls.isEdgeMode && Object.keys(props.doc.edges).length === 0) {
    msg = <p> click on nodes <br /> to connect them </p>
  }

  return <div id='petc-breadcrumbs'> {msg} </div>
}
