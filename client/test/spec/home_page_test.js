/* global fixture test */
/* eslint template-tag-spacing: ["error", "always"] */

import { Selector } from 'testcafe'

fixture `on home page`
  .page `http://localhost:5000`

const titleEle = Selector('title')
const createNewButton = Selector('#petc-create-new')

test('should have title', async t => {
  await t
    .expect(titleEle.exists).ok()
    .expect(titleEle.innerText).eql('pannus et circulos')
})

test('should allow create new doc', async t => {
  await t
    .expect(createNewButton.exists).ok()
    .click(createNewButton)
    .expect(createNewButton.exists).notOk()

  const location = await t.eval(() => window.location)
  await t.expect(location.pathname).match(/\/docs\/.*/)
})
