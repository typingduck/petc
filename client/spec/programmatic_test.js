/* global fixture test */

import axios from 'axios'

import s from './selectors'
import fixtures from './fixtures'

fixture('on view page')
  .beforeEach(async t => {
    await fixtures.initializeNewTestDoc(t)
    await t.navigateTo(t.fixtureCtx.docUrl)
  })

test('should update edge style in view after api update ', async t => {
  const edgeLine = await s.edges.nth(1).find('path')
  await t.expect(edgeLine.getStyleProperty(s.EDGE_COLOR_PROPERTY)).eql(s.EDGE_DEFAULT_COLOR)

  await applyPatch(t, { op: 'add', path: '/edges/e-02/className', value: 'cyan-edge' })

  await t.expect(edgeLine.getStyleProperty(s.EDGE_COLOR_PROPERTY)).eql(s.CYAN)
})

test('should update edge label in view after api update', async t => {
  const edgeLabel = await s.edgeLabels.nth(1)
  await t.expect(edgeLabel.innerText).eql('e.two')

  await applyPatch(t, { op: 'replace', path: '/edges/e-02/label', value: 'foo' })

  await t.expect(edgeLabel.innerText).eql('foo')
})

test('should update node style in view after api update ', async t => {
  await t.expect(s.node2.hasClass('cyan-node')).notOk()

  await applyPatch(t, { op: 'add', path: '/nodes/n-02/className', value: 'cyan-node' })

  await t.expect(s.node2.hasClass('cyan-node')).ok()
})

test('should update node label in view after api update', async t => {
  const nodeLabel = s.nodeLabel('n-02')
  await t.expect(nodeLabel.innerText).eql('n.two')

  await applyPatch(t, { op: 'replace', path: '/nodes/n-02/label', value: 'baz' })

  await t.expect(nodeLabel.innerText).eql('baz')
})

test('should update node position in view after api update', async t => {
  const nodeY = s.node2.getBoundingClientRectProperty('top')

  await t.expect(nodeY).eql(360)

  await applyPatch(t, { op: 'replace', path: '/nodes/n-02/y', value: 15 })

  await t.expect(nodeY).eql(25)
})

async function applyPatch (t, patch) {
  const apiDocUrl = `${s.apiUrl}/docs/${t.fixtureCtx.docid}`
  return axios.patch(apiDocUrl, patch)
}
