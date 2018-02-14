/* global fixture location test */
const { Selector } = require('testcafe')

fixture `on home page`
  .page `http://localhost:5000`

const titleEle = Selector('title')
const createNewButton = Selector('a')

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
