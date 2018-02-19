import axios from 'axios'
import io from 'socket.io-client'
import uuid from 'uuid/v4'

import config from '../conf/config'

export function initialDoc () {
  return {
    nodes: {},  // map of id -> {id, x, y}
    edges: {}   // map of id -> {id, source, target}
  }
}

export function createNode (x, y) {
  const id = uuid().substring(0, 8)
  return {id, x, y}
}

export function createEdge (source, target) {
  const id = source + '-' + target
  return {id, source, target}
}

export async function createNewDoc () {
  const {data} = await db().post('docs', initialDoc())
  return data
}

export async function loadDoc (docId) {
  const {data: doc} = await db().get(`docs/${docId}`)
  return removeMetaKeys(doc)
}

export async function saveDoc (doc) {
  const {data} = await db().put(`docs/${doc._id}`, doc)
  return data
}

export async function connectSocket (docId, cb) {
  const socket = await io(config.API_URL)
  socket.emit('doc-select', docId)
  socket.on('doc-patch', cb)

  return {
    addNode: node =>
      socket.emit('doc-patch', { 'op': 'add', 'path': `/nodes/${node.id}`, 'value': node }),
    updateNode: node =>
      socket.emit('doc-patch', { 'op': 'replace', 'path': `/nodes/${node.id}`, 'value': node }),
    removeNode: node =>
      socket.emit('doc-patch', { 'op': 'remove', 'path': `/nodes/${node.id}` }),
    addEdge: edge =>
      socket.emit('doc-patch', { 'op': 'add', 'path': `/edges/${edge.id}`, 'value': edge })
  }
}

function db () {
  return axios.create({
    baseURL: config.API_URL
  })
}

function removeMetaKeys (doc) {
  delete doc['_id']
  delete doc['_rev']
  return doc
}
