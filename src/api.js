const apiUrl = 'https://api.studio.thegraph.com/query/9578/drips-subgraph-mainnet-v2/v0.0.1'

const cacheAPISec = process.env.VUE_APP_CACHE_API_SEC // string

export default async function ({ query, variables }) {
  const id = btoa(JSON.stringify({ query, variables }))
  try {
    // cached ?
    let cached = sessionStorage.getItem(id)
    if (cached && cacheAPISec > 0) {
      cached = JSON.parse(cached)
      const secSince = new Date().getTime() - cached.time
      if (secSince > cacheAPISec) {
        // slightly delay response...
        return new Promise((resolve) => setTimeout(() => resolve(cached.data), 200))
      }
    }

    // fetch new...
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables })
    })

    if (resp.status >= 200 && resp.status <= 299) {
      const data = await resp.json()

      // cache resp?
      if (cacheAPISec) {
        sessionStorage.setItem(id, JSON.stringify({ data, time: new Date().getTime() }))
      }

      return data
    } else {
      throw Error(resp.statusText)
    }
  } catch (e) {
    console.log('api err', e, e.message, e.status)
    console.error('@graphAPI', e)
    sessionStorage.removeItem(id)
    throw e
  }
}

export const queryProject = `
  query ($id: ID!) {
    fundingProject (id: $id) {
      id
      projectOwner
      daiCollected
      daiSplit
      ipfsHash
      tokenTypes {
        # id
        tokenTypeId
        limit
        minAmt: minAmtPerSec
        streaming
      }
    }
  }
`

export const queryProjectMeta = `
  query ($id: ID!) {
    fundingProject (id: $id) {
      ipfsHash
    }
  }
`
