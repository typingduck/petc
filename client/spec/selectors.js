/**
 * Central place to specify page elements.
 */

/* global module */
/* eslint-disable key-spacing */

import { Selector } from 'testcafe'

module.exports = {

  testUrl    : 'http://localhost:5000',
  docUrl     : (docid) => 'http://localhost:5000/docs/' + docid,
  apiUrl     : 'http://localhost:5001',

  title      : Selector('title'),

  kanvas     : Selector('#petc-kanvas'),
  nodes      : Selector('#petc-kanvas').find('.petc-node'),
  edges      : Selector('#petc-kanvas').find('.jtk-connector'),
  node1      : Selector('#n-01'),
  node2      : Selector('#n-02'),
  node3      : Selector('#n-03'),
  nodeLabel  : nodeId => Selector(`#${nodeId}-wrapper`).find('.petc-node-label'),
  edgeLabels : Selector('.petc-edge-label'),

  EDGE_COLOR_PROPERTY : 'stroke',
  EDGE_DEFAULT_COLOR  : 'rgba(100, 100, 100, 0.5)',
  NODE_DEFAULT_COLOR  : 'rgb(128, 128, 128)',
  CYAN                : 'rgb(0, 255, 255)',

  homePage: {
    createNewButton  : Selector('#petc-create-new'),
    createDemoButton : Selector('#petc-create-demo')
  },

  nodePage: {
    nodeControls     : Selector('#petc-node-select-control'),
    nodeStyleButtons : Selector('#petc-node-select-control li'),
    trashCan         : Selector('#petc-trashcan')
  },

  attrEditor: {
    modal       : Selector('.petc-attr-editor'),
    labelField  : Selector('.petc-attr-editor').find('input'),
    styleOption : (value) => Selector('.petc-attr-editor').find('option').withText(value),
    applyButton : Selector('button').nth(0)
  },

  edgePage: {
    edgeControls     : Selector('#petc-edge-select-control'),
    edgeStyleButtons : Selector('#petc-edge-select-control li'),
    edgeEndPoints    : Selector('#petc-kanvas').find('.jtk-endpoint')
  },

  navigation: {
    viewControls    : Selector('#petc-view-mode-control'),
    viewOnlyButton  : Selector('#petc-vmc-view'),
    editNodesButton : Selector('#petc-vmc-node'),
    editEdgesButton : Selector('#petc-vmc-edge')
  }
}
