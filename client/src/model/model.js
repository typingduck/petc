import axios from 'axios'
import config from '../conf/config'
import io from 'socket.io-client'

export function initialDoc () {
  return {
    nodes: []  // list of {id, x, y}
  }
}

export async function createNewDoc () {
  const {data} = await db().post('docs', initialDoc())
  return data
}

export async function loadDoc (docId) {
  const {data} = await db().get(`docs/${docId}`)
  return data
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
    addNode (node) {
      socket.emit('doc-patch', { 'op': 'add', 'path': '/nodes/-', 'value': node })
    }
  }
}

function db () {
  return axios.create({
    baseURL: config.API_URL
  })
}
