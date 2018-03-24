/**
 * All page elements.
 */

/* global module */
/* eslint-disable key-spacing */

import { Selector } from 'testcafe'

module.exports = {

  testUrl: 'http://localhost:5000',
  docUrl : (docid) => 'http://localhost:5000/docs/' + docid,
  apiUrl : 'http://localhost:5001',

  title  : Selector('title'),
  nodes  : Selector('.petc-node'),
  edges  : Selector('.jtk-connector'),
  kanvas : Selector('#petc-kanvas'),

  node1  : Selector('#n-01'),
  node2  : Selector('#n-02'),
  node3  : Selector('#n-03'),

  homePage: {
    createNewButton: Selector('#petc-create-new'),
    createDemoButton: Selector('#petc-create-demo')
  },

  viewPage: {
  },

  nodePage: {
    nodeControls : Selector('#petc-node-select-control'),
    trashCan     : Selector('#petc-trashcan')
  },

  edgePage: {
    edgeControls  : Selector('#petc-edge-select-control'),
    edgeEndPoints : Selector('.jtk-endpoint')
  },

  navigation: {
    viewControls    : Selector('#petc-view-mode-control'),
    viewOnlyButton  : Selector('#petc-vmc-view'),
    editNodesButton : Selector('#petc-vmc-node'),
    editEdgesButton : Selector('#petc-vmc-edge')
  }
}
