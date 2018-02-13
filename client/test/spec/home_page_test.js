
const { Selector } = require('testcafe')

fixture `on home page`
  .page `http://localhost:3333`

const titleEle = Selector('title')

test('should have title', async t => {
  await t
    .expect(titleEle.exists).ok()
    .expect(titleEle.innerText).eql('pannus et circulos')
});

