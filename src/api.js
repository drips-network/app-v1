const apiUrl = import.meta.env.VITE_APP_GRAPH_API

const cacheAPISec = import.meta.env.VITE_APP_CACHE_API_SEC // string

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

      // cache resp?
      if (cacheAPISec) {
        sessionStorage.setItem(id, JSON.stringify({ data, time: new Date().getTime() }))
      }

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
      name: projectName
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
      id
      receiver
      amtPerSec
    }
  }
}
`

export const queryDripsByReceiver = `
query ($receiver: Bytes!) {
  dripsEntries (where: { receiver: $receiver} ) {
    id
    sender: user
    receiver
    amtPerSec
 }
}
`

export const querySplitsBySender = `
query ($sender: Bytes!, $first: Int!) {
  splitsEntries (first: $first, where: { sender: $sender }) {
    id
    sender
    receiver
    weight
  }
}
`

export const querySplitsByReceiver = `
query ($receiver: Bytes!, $first: Int!) {
  splitsEntries (first: $first, where: { receiver: $receiver }) {
    id
    sender
    receiver
    weight
  }
}
`

export const queryIdentityMetadataByAddress = `
query ($id: ID!) {
  identityMetaData (id: $id) {
    id
    multiHash
  }
}
`

export const queryDrip = `
query ($id: ID!) {
  dripsEntry (id: $id) {
    id
    account
    amtPerSec
    sender: user
    receiver
  }
}
`

export const querySplit = `
query ($id: ID!) {
  splitsEntry (id: $id) {
    id
    sender
    receiver
    weight
  }
}
`

// gives

export const queryGive = `
query ($id: ID!) {
  give (id: $id) {
    id
    sender 
    receiver
    amount
    timestamp: blockTimestampGiven
  }
}
`

export const queryGivesByReceiver = `
query getGivesByReceiver ($address: Bytes!) {
  gives (where: { receiver: $address }) {
    id
    sender 
    receiver
    amount
    timestamp: blockTimestampGiven
  }
}
`

export const queryGivesBySender = `
query ($address: Bytes!) {
  gives (where: { sender: $address }) {
    id
    sender 
    receiver
    amount
    timestamp: blockTimestampGiven
  }
}
`
