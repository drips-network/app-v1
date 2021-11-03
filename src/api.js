export default async function ({ query, variables }) {
  try {
    const resp = await fetch(`${process.env.VUE_APP_GRAPH_API}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables })
    })

    if (resp.status >= 200 && resp.status <= 299) {
      return await resp.json()
    } else {
      throw Error(resp.statusText)
    }
  } catch (e) {
    console.log('api err', e, e.message, e.status)
    console.error('@graphAPI', e)
    throw e
  }
}

export const queryProject = `
  query ($id: ID!) {
    fundingProject (id: $id) {
      id
      projectOwner
      # daiCollected
      ipfsHash
      nftTypes {
        # id
        nftTypeId
        limit
        minAmtPerSec
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
