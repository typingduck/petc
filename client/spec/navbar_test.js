/* global fixture test */

import s from './selectors'
import fixtures from './fixtures'

fixture('using navigation bar')
  .beforeEach(fixtures.initializeNewTestDoc)

test('controls should be enabled/disabled depending on page', async t => {
  // on view page: controls should not visible be visible
  await t
    .expect(s.navigation.viewControls.visible).ok()
    .expect(s.nodePage.nodeControls.exists).notOk()
    .expect(s.nodePage.trashCan.hasClass('hidden')).ok()
    .expect(s.edgePage.edgeControls.exists).notOk()
    .expect(s.edgePage.edgeEndPoints.visible).notOk()

  // on edit nodes page: node editing controls should be visible
  await t
    .click(s.navigation.editNodesButton)
    .expect(s.navigation.viewControls.visible).ok()
    .expect(s.nodePage.nodeControls.visible).ok()
    .expect(s.nodePage.trashCan.hasClass('hidden')).notOk()
    .expect(s.edgePage.edgeControls.exists).notOk()
    .expect(s.edgePage.edgeEndPoints.visible).notOk()

  // on edit edges page: edge editing controls should be visible
  await t
    .click(s.navigation.editEdgesButton)
    .expect(s.navigation.viewControls.visible).ok()
    .expect(s.nodePage.nodeControls.exists).notOk()
    .expect(s.nodePage.trashCan.hasClass('hidden')).ok()
    .expect(s.edgePage.edgeControls.visible).ok()
    .expect(s.edgePage.edgeEndPoints.visible).ok()

  // returning to view page again should hide controls
  await t
    .click(s.navigation.viewOnlyButton)
    .expect(s.navigation.viewControls.visible).ok()
    .expect(s.nodePage.nodeControls.exists).notOk()
    .expect(s.nodePage.trashCan.hasClass('hidden')).ok()
    .expect(s.edgePage.edgeControls.exists).notOk()
    .expect(s.edgePage.edgeEndPoints.visible).notOk()
})
