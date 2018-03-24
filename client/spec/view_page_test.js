/* global fixture test */

import s from './selectors'
import fixtures from './fixtures'

fixture('on view page')
  .beforeEach(fixtures.initializeNewTestDoc)

test('should have title', async t => {
  await t
    .expect(s.title.exists).ok()
    .expect(s.title.innerText).eql('pannus et circulos')
})

test('should be pre-filled with test doc', async t => {
  await t
    .expect(s.nodes.count).eql(3)
    .expect(s.edges.count).eql(2)
})

test('should not allow dragging nodes', async t => {
  const aNode = await s.nodes.nth(0)
  const oldPos = await aNode.getBoundingClientRectProperty('top')

  await t
    .drag(aNode, 0, 10)
    .expect(aNode.getBoundingClientRectProperty('top')).eql(oldPos)
})

test('should not allow dragging edges', async t => {
  await t
    .expect(s.edgePage.edgeEndPoints.exists).ok()
    .expect(s.edgePage.edgeEndPoints.visible).notOk()
})

test('should hide edit controls', async t => {
  await t
    .expect(s.nodePage.nodeControls.exists).notOk()
    .expect(s.edgePage.edgeControls.exists).notOk()
})
