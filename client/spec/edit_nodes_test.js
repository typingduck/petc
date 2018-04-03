/* global fixture test */

import s from './selectors'
import fixtures from './fixtures'

fixture('on nodes page')
  .beforeEach(async t => {
    await fixtures.initializeNewTestDoc(t)
    await t.navigateTo(t.fixtureCtx.docUrl + '#node')
  })

test('should show nodes', async t => {
  await t
    .expect(s.nodes.count).eql(3)
})

test('should show node labels', async t => {
  await t
    .expect(s.nodeLabel('n-01').innerText).eql('n.one')
    .expect(s.nodeLabel('n-02').innerText).eql('n.two')
    .expect(s.nodeLabel('n-03').innerText).eql('n.three')
})

test('should allow nodes to be moved by dragging', async t => {
  const oldPos = await s.node1.getBoundingClientRectProperty('top')

  await t
    .drag(s.node1, 0, 10)
    .expect(s.node1.getBoundingClientRectProperty('top')).eql(oldPos + 10)
})

test('should create node on canvas click', async t => {
  const nodesCount = await s.nodes.count

  await t
    .click(s.kanvas, { offsetX: 500, offsetY: 225 })
    .expect(s.nodes.count).eql(nodesCount + 1)
})

test('should delete node (and its edges) on drag to trash', async t => {
  const nodesCount = await s.nodes.count
  const edgesCount = await s.edges.count

  const node1Pos = await s.node1.boundingClientRect
  const trashCanPos = await s.nodePage.trashCan.boundingClientRect
  const dx = parseInt(trashCanPos.left - node1Pos.left + node1Pos.width)
  const dy = parseInt(trashCanPos.top - node1Pos.top + node1Pos.height)

  await t
    .drag(s.node1, dx, dy)
    .expect(s.nodes.count).eql(nodesCount - 1)
    .expect(s.edges.count).eql(edgesCount - 1)
})

test('should delete node (and its edges) on drag to trash', async t => {
  const nodesCount = await s.nodes.count
  const edgesCount = await s.edges.count

  const node1Pos = await s.node1.boundingClientRect
  const trashCanPos = await s.nodePage.trashCan.boundingClientRect
  const dx = parseInt(trashCanPos.left - node1Pos.left + node1Pos.width)
  const dy = parseInt(trashCanPos.top - node1Pos.top + node1Pos.height)

  await t
    .drag(s.node1, dx, dy)
    .expect(s.nodes.count).eql(nodesCount - 1)
    .expect(s.edges.count).eql(edgesCount - 1)
})

test('should show node editing controls', async t => {
  await t
    .expect(s.nodePage.nodeControls.visible).ok()
    .expect(s.nodePage.trashCan.hasClass('hidden')).notOk()
})

test('should show testdoc styles', async t => {
  await t.expect(s.nodePage.nodeStyleButtons.count).eql(3)

  const cyanStyleButton = s.nodePage.nodeStyleButtons.nth(1)
  await t.expect(cyanStyleButton.find('div').nth(1).innerText).eql('cyan-node')
})

test('should create node with selected style drag', async t => {
  const nodesCount = await s.nodes.count

  const cyanStyleButton = s.nodePage.nodeStyleButtons.nth(1)
  await t
    .drag(cyanStyleButton, 200, 10)
    .expect(s.nodes.count).eql(nodesCount + 1)
    .expect(s.nodes.nth(nodesCount).hasClass('cyan-node')).ok()
})

test('should create nodes with selected style click', async t => {
  const nodesCount = await s.nodes.count

  const cyanStyleButton = s.nodePage.nodeStyleButtons.nth(1)
  await t
    .click(cyanStyleButton)
    .click(s.kanvas, { offsetX: 500, offsetY: 225 })
    .expect(s.nodes.count).eql(nodesCount + 1)
    .expect(s.nodes.nth(nodesCount).hasClass('cyan-node')).ok()
})

// For some reason testcafe does not transfer the css styles without first
// expanding them (border-color becomes border-{top,bottom,left,rigth}-color)
// and converting colors names into rgb values (css cyan becomes rgb(0, 255, 255)).
const BORDER_COLOR = 'border-bottom-color'

test('should allow changing node style', async t => {
  await t
    .expect(s.node1.getStyleProperty(BORDER_COLOR)).eql(s.NODE_DEFAULT_COLOR)
    .expect(s.node1.hasClass('cyan-node')).notOk()
    .expect(s.attrEditor.modal.exists).notOk()
    .click(s.node1)
    .expect(s.attrEditor.modal.visible).ok()
    .click(s.attrEditor.modal.find('select'))
    .click(s.attrEditor.styleOption('cyan-node'))
    .click(s.attrEditor.applyButton)
    .expect(s.attrEditor.modal.exists).notOk()
    .expect(s.node1.getStyleProperty(BORDER_COLOR)).eql(s.CYAN)
    .expect(s.node1.hasClass('cyan-node')).ok()
})

test('should allow changing node label', async t => {
  await t
    .expect(s.nodeLabel('n-01').innerText).eql('n.one')
    .expect(s.attrEditor.modal.exists).notOk()
    .click(s.node1)
    .expect(s.attrEditor.modal.visible).ok()
    .click(s.attrEditor.labelField)
    .pressKey('ctrl+a delete')
    .typeText(s.attrEditor.labelField, 'foo')
    .click(s.attrEditor.applyButton)
    .expect(s.attrEditor.modal.exists).notOk()
    .expect(s.nodeLabel('n-01').innerText).eql('foo')
})
