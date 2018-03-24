/* global fixture test */

import s from './selectors'
import fixtures from './fixtures'

fixture('on nodes page')
  .beforeEach(async t => {
    await fixtures.initializeNewTestDoc(t)
    await t.navigateTo(t.fixtureCtx.docUrl + '#node')
  })

test('should show node edting controls', async t => {
  await t
    .expect(s.nodePage.nodeControls.visible).ok()
    .expect(s.nodePage.trashCan.hasClass('hidden')).notOk()
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
