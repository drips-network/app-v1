export default async function ({ query, variables }) {
  try {
    const resp = await fetch(process.env.VUE_APP_GRAPH_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables })
    })
    return await resp.json()
  } catch (e) {
    console.error('@graphAPI', e)
    throw e
  }
}
