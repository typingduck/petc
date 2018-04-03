/* global fixture test */
/* eslint template-tag-spacing: ["error", "always"] */

import s from './selectors'

fixture('on home page')
  .page(s.testUrl)

test('should have title', async t => {
  await t
    .expect(s.title.exists).ok()
    .expect(s.title.innerText).eql('pannus et circulos')
})

test('should allow create new doc', async t => {
  await t
    .expect(s.homePage.createNewButton.exists).ok()
    .click(s.homePage.createNewButton)
    .expect(s.homePage.createNewButton.exists).notOk()

  const location = await t.eval(() => window.location)
  await t
    .expect(location.pathname).match(/\/docs\/.*/)
    .expect(s.nodes.count).eql(0)
    .expect(s.edges.count).eql(0)
})

test('should allow create demo doc', async t => {
  await t
    .expect(s.homePage.createDemoButton.exists).ok()
    .click(s.homePage.createDemoButton)
    .expect(s.homePage.createDemoButton.exists).notOk()

  const location = await t.eval(() => window.location)
  await t
    .expect(location.pathname).match(/\/docs\/.*/)
    .expect(s.nodes.count).eql(10)
    .expect(s.edges.count).eql(19)
})
