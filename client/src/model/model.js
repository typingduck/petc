
const config = require('../conf/config')
const axios = require('axios')

function db () {
  return axios.create({
    baseURL: config.API_URL
  })
}

export async function createNewDoc () {
  const {data} = await db().post('docs', {})
  return data
}
