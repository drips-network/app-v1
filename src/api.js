const apiUrl = process.env.VUE_APP_GRAPH_API

const cacheAPISec = process.env.VUE_APP_CACHE_API_SEC // string

export default async function ({ query, variables }) {
  const id = btoa(JSON.stringify({ query, variables }))
  try {
    if (!apiUrl) {
      throw new Error('API URL missing')
    }

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

      // graphql errors?
      if (data.errors) {
        throw new Error(JSON.stringify(data.errors))
      }

      // cache resp?
      if (cacheAPISec) {
        sessionStorage.setItem(id, JSON.stringify({ data, time: new Date().getTime() }))
      }

      // success!
      return data
    } else {
      throw Error(resp.statusText)
    }
  } catch (e) {
    console.error(e)
    sessionStorage.removeItem(id)
    throw new Error('API Error')
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
        tokenTypeId
        id
        minAmt: minAmtPerSec
        limit
        currentTotalAmtPerSec
        currentTotalGiven
        ipfsHash
        streaming
      }
      tokens {
        owner: tokenReceiver
        giveAmt
        amtPerSec
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

export const queryDripsConfigByID = `
query ($id: ID!) {
  dripsConfigs (where: {id: $id}, first: 1) {
    id
    balance
    timestamp: lastUpdatedBlockTimestamp
    receivers: dripsEntries {
      receiver
      amtPerSec
    }
  }
}
`

export const querySplitsBySender = `
query ($sender: Bytes!) {
  splitsEntries (first:100, where: { sender: $sender }) {
    # id
    sender
    receiver
    weight
  }
}
`
