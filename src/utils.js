import { BigNumber as bn, constants, utils } from 'ethers'

export const ipfsUrl = hash => process.env.VUE_APP_IPFS_GATEWAY + '/ipfs/' + hash

export const fromWei = (wei) => {
  wei = bn.isBigNumber(wei) ? wei : bn.from(wei)
  return wei.div(constants.WeiPerEther)
}

export const toWei = (dai) => {
  return constants.WeiPerEther.mul(dai)
}

export const toDAIPerMo = (weiBN) => {
  const dai = utils.formatEther(weiBN) * 30 * 24 * 60 * 60
  // round to nearest hundredth
  return Math.round(dai * 100) / 100
}

export const toWeiPerSec = (dai = 0) => {
  // warning! BN will clip off the decimal...
  // (but maybe good for when setting minAmtPerSec)
  return utils.parseUnits(dai.toString()).div(30 * 24 * 60 * 60)
}

/*
 * format drips for contract method input
 * @param drips [{ address, percent }]
*/
export const formatDrips = (drips) => {
  drips = drips || []
  let dripFraction = 0
  let receiverWeights = []

  const hasDrips = drips.length && drips.find(drip => drip.percent > 0 && drip.address.length)

  if (hasDrips) {
    // figure out drip fraction from sum of drips' weights
    const dripFractionMax = 1000000
    const dripsPercentSum = drips.reduce((acc, cur) => acc + (cur.percent || 0), 0)
    dripFraction = parseInt(dripsPercentSum / 100 * dripFractionMax)

    // format as array
    receiverWeights = drips.map(drip => {
      // weight of this receiver against the total dripFraction amount, as integer (max 10K)
      const amtPerSec = parseInt((drip.percent / 100 * dripFractionMax) / dripFraction * 1000)
      return [
        drip.address, // receiver
        amtPerSec
      ]
    })

    // sort by address alphabetical
    receiverWeights = receiverWeights.sort((a, b) => {
      a = a[0].toUpperCase()
      b = b[0].toUpperCase()
      return (a < b) ? -1 : (a > b) ? 1 : 0
    })
  }

  return [
    dripFraction,
    receiverWeights
  ]
  // "empty" drips = [0, []]
}

/*
 * format drips for contract method input (no dripFraction :)
 * @param drips [{ address, percent }]
*/
export const formatSplits = (splits) => {
  splits = splits || []
  let receivers = []
  const splitFractionMax = 1000000

  const hasDrips = splits.length && splits.find(split => split.percent > 0 && split.address.length)

  if (hasDrips) {
    // format as array
    receivers = splits.map(split => {
      const amtPerSec = parseInt(split.percent / 100 * splitFractionMax)
      return [
        split.address, // receiver
        amtPerSec
      ]
    })

    // sort by address alphabetical
    receivers = receivers.sort((a, b) => {
      a = a[0].toUpperCase()
      b = b[0].toUpperCase()
      return (a < b) ? -1 : (a > b) ? 1 : 0
    })
  }

  return receivers
}

export function validateSplits (drips, provider) {
  drips = drips || []
  const validate = async () => {
    // validate each address...
    for (var i = 0; i < drips.length; i++) {
      if (!utils.isAddress(drips[i][0])) {
        // !! not an ENS
        if (!drips[i][0].endsWith('.eth')) {
          throw new Error(`Invalid drip recipient: ${drips[i][0]} is not an Ethereum address or ENS name (must end in .eth).`)
        }
        // resolve ENS name...
        const address = await provider.resolveName(drips[i][0])

        if (!address) {
          throw new Error(`Invalid drip recipient: ${drips[i][0]} does not resolve to an Ethereum address.`)
        }

        // replace ens with address
        drips[i][0] = address
      }
    }

    return drips
  }

  return new Promise((resolve, reject) => validate().then(resolve).catch(reject))
}
