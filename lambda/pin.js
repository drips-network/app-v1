import pinataSDK from '@pinata/sdk'
require('dotenv').config()
const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET)

exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body)

    const options = {
      pinataMetadata: {
        name: `Project: ${body.name}`,
        keyvalues: {
          type: 'project'
          // customKey2: 'customValue2'
        }
      }
      // pinataOptions: {
      //   cidVersion: 0
      // }
    }

    const resp = await pinata.pinJSONToIPFS(body, options)

    /** Response:
    {
        IpfsHash: This is the IPFS multi-hash provided back for your content,
        PinSize: This is how large (in bytes) the content you just pinned is,
        Timestamp: This is the timestamp for your content pinning (represented in ISO 8601 format)
    }
    **/

    return {
      statusCode: 200,
      body: JSON.stringify(resp)
    }
  } catch (e) {
    console.error(e)

    return {
      statusCode: 500,
      body: JSON.stringify({ status: 500, message: 'Internal Server Error', error: e })
    }
  }
}
