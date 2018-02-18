import React from 'react'
import './StoreView.css'

/**
 * A useful development tool for viewing the redux state in the browser.
 * Hidden during normal viewing.
 */
export default function StoreView (props) {
  if (props.controls.storeview) {
    return (
      <pre id='petc-storeview'>
        {props.docId}<br />
        {JSON.stringify(props.controls, null, 2)}
        <hr />
        {JSON.stringify(props.doc, null, 2)}
      </pre>
    )
  } else {
    return null
  }
}
