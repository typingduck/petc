/* global __dirname console module */
/* eslint-disable no-console */

/**
 * Test fixtures for reuse amongst many tests.
 */
import Promise from 'bluebird'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import util from 'util'
import uuid from 'uuid'

import s from './selectors'

const readFileAsync = util.promisify(fs.readFile)

/**
 * Using the API setup a sample document with 3 nodes and 3 edges.
 */
async function createNewDoc () {
  const docid = 'test-' + uuid.v4()
  const data = await readFileAsync(path.join(__dirname, 'testdoc.json'))
  const obj = JSON.parse(data)
  const apiUrl = `${s.apiUrl}/docs/${docid}`
  try {
    await axios.put(apiUrl, obj)
  } catch (e) {
    console.error(e.message)
    console.error('Failed to call API. Is the server running?')
    throw e
  }
  return Promise.resolve(docid)
}

/**
 * Create a prefilled test document and navigate to it before tests start.
 */
module.exports.initializeNewTestDoc = async (testController) => {
  const docid = await createNewDoc()
  const docUrl = s.docUrl(docid)
  testController.fixtureCtx.docid = docid
  testController.fixtureCtx.docUrl = docUrl
  // TODO: would be nice if there was a way to set this up in the testCafe
  // fixture .page witout resorting to navigateTo.
  return testController.navigateTo(docUrl)
}
