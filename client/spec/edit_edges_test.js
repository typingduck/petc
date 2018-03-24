/* global fixture test */

import s from './selectors'
import fixtures from './fixtures'

fixture('on edges page')
  .beforeEach(async t => {
    await fixtures.initializeNewTestDoc(t)
    await t.navigateTo(t.fixtureCtx.docUrl + '#edge')
  })

test('should show edge edting controls', async t => {
  await t
    .expect(s.edgePage.edgeControls.visible).ok()
})

test('should show edge endpoints', async t => {
  await t
    .expect(s.edgePage.edgeEndPoints.exists).ok()
    .expect(s.edgePage.edgeEndPoints.visible).ok()
    .expect(s.edgePage.edgeEndPoints.count).eql(6)
})

test('should create edge on node clicks', async t => {
  const edgesCount = await s.edges.count

  await t
    .click(s.node3)
    .click(s.node1)
    .expect(s.edges.count).eql(edgesCount + 1)
})

test('should delete edges on endpoint drag', async t => {
  const endPointCount = await s.edgePage.edgeEndPoints.count
  const edgesCount = await s.edges.count
  const anEndpoint = await s.edgePage.edgeEndPoints.nth(0)

  // drag endpoint to remove edge
  await t
    .drag(anEndpoint.nth(0), 100, 100)
    .expect(s.edgePage.edgeEndPoints.count).eql(endPointCount - 2)
    .expect(s.edges.count).eql(edgesCount - 1)
})
