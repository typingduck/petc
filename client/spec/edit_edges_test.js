/* global fixture test */

import s from './selectors'
import fixtures from './fixtures'

fixture('on edges page')
  .beforeEach(async t => {
    await fixtures.initializeNewTestDoc(t)
    await t.navigateTo(t.fixtureCtx.docUrl + '#edge')
  })

test('should show edges', async t => {
  await t
    .expect(s.edges.count).eql(2)
})

test('should show edge labels', async t => {
  await t
    .expect(s.edgeLabels.nth(0).innerText).eql('e.one')
    .expect(s.edgeLabels.nth(1).innerText).eql('e.two')
})

test('should show edge endpoints', async t => {
  await t
    .expect(s.edgePage.edgeEndPoints.exists).ok()
    .expect(s.edgePage.edgeEndPoints.visible).ok()
    .expect(s.edgePage.edgeEndPoints.count).eql(4)
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

test('should show edge edting controls', async t => {
  await t
    .expect(s.edgePage.edgeControls.visible).ok()
})

test('should show testdoc styles', async t => {
  await t.expect(s.edgePage.edgeStyleButtons.count).eql(3)

  const cyanEdge = s.edgePage.edgeStyleButtons.nth(1)
  await t.expect(cyanEdge.child(1).innerText).eql('cyan-edge')
})

test('should create edges with selected style', async t => {
  const edgesCount = await s.edges.count
  const cyanStyleButton = s.edgePage.edgeStyleButtons.nth(1)
  await t
    .click(cyanStyleButton)
    .click(s.node3)
    .click(s.node1)
    .expect(s.edges.count).eql(edgesCount + 1)
    .expect(s.edges.nth(edgesCount).find('path').getStyleProperty(s.EDGE_COLOR_PROPERTY)).eql(s.CYAN)
})

test('should allow changing edge style', async t => {
  const edge = await s.edges.nth(1)

  await t
    .expect(edge.find('path').getStyleProperty(s.EDGE_COLOR_PROPERTY)).eql(s.EDGE_DEFAULT_COLOR)
    .expect(s.attrEditor.modal.exists).notOk()
    .click(edge)
    .expect(s.attrEditor.modal.visible).ok()
    .click(s.attrEditor.modal.find('select'))
    .click(s.attrEditor.styleOption('cyan-edge'))
    .click(s.attrEditor.applyButton)
    .expect(s.attrEditor.modal.exists).notOk()
    .expect(edge.find('path').getStyleProperty(s.EDGE_COLOR_PROPERTY)).eql(s.CYAN)
})

test('should allow changing edge label', async t => {
  await t
    .expect(s.edgeLabels.nth(1).innerText).eql('e.two')
    .expect(s.attrEditor.modal.exists).notOk()
    .click(s.edges.nth(1))
    .expect(s.attrEditor.modal.visible).ok()
    .click(s.attrEditor.labelField)
    .pressKey('ctrl+a delete')
    .typeText(s.attrEditor.labelField, 'foo')
    .click(s.attrEditor.applyButton)
    .expect(s.attrEditor.modal.exists).notOk()
    .expect(s.edgeLabels.nth(1).innerText).eql('foo')
})
