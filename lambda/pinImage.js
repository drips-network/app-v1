import { Readable } from 'stream'
import FormData from 'form-data'
import axios from 'axios'
require('dotenv').config()

exports.handler = async function (event, context) {
  try {
    let imgString = JSON.parse(event.body)

    // remove "...base 64" pretext ?
    if (imgString.includes('base64,')) {
      imgString = imgString.split('base64,')[1]
    }

    const imgBuffer = Buffer.from(imgString, 'base64')
    const stream = Readable.from(imgBuffer)
    const data = new FormData()

    // !! image too large (200kb max)
    if (Buffer.byteLength(imgBuffer) > 500000) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: 400, message: 'Image must be <500kb', error: true })
      }
    }

    data.append('file', stream, {
      filepath: 'project-profile.png'
    })

    const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
      maxBodyLength: 'Infinity',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_API_SECRET
      }
    })

    return {
      statusCode: 200,
      body: JSON.stringify(res.data)
    }
  } catch (e) {
    console.error(e)

    return {
      statusCode: 500,
      body: JSON.stringify({ status: 500, message: 'Internal Server Error', error: e })
    }
  }
}
