import { BigNumber as bn, constants, utils } from 'ethers'
import store from '@/store'

export const oneMonth = 30 * 24 * 60 * 60

export const ipfsUrl = hash => import.meta.env.VITE_APP_IPFS_GATEWAY + '/ipfs/' + hash

// round up to nearest hundreth
export const round = (num, dec = 2) => Math.ceil(num * 100) / 100
// clip to nearest hundredth (dont round up)
// export const round = (num, dec = 2) => Number((Math.floor(num * 100) / 100).toFixed(dec))

export const fromWei = (wei) => {
  wei = bn.isBigNumber(wei) ? wei : bn.from(wei)
  return wei.div(constants.WeiPerEther)
}

export const toWei = (dai) => {
  return utils.parseUnits(dai.toString())
}

export const toDAI = (wei, frmt = 'pretty', roundTo) => {
  const dai = utils.formatEther(wei)
  if (frmt === 'exact') {
    return dai
  }
  // tiny amount
  if (dai > 0 && dai < 0.01) {
    return '<0.01'
  }
  // rounding
  return round(dai, roundTo)
}

export const toDAIPerMo = (wei, roundTo = 2) => {
  // convert to BN
  wei = bn.isBigNumber(wei) ? wei : bn.from(wei)
  // 
  let daiPerMo = utils.formatEther(wei.mul(oneMonth))

  if (daiPerMo > 0 && daiPerMo < 0.01) {
    return '<0.01'
  }

  // round to nearest hundredth
  daiPerMo = round(daiPerMo, roundTo)

  return daiPerMo.toLocaleString()
}

export const toWeiPerSec = (dai = 0) => {
  // warning! BN will clip off the decimal...
  // (but maybe good for when setting minAmtPerSec)
  return utils.parseUnits(dai.toString()).div(oneMonth)
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

export const validateAddressInput = input => {
  return new Promise((resolve, reject) => {
    if (utils.isAddress(input)) {
      return resolve(input)
    }

    // !! not even ENS
    if (!input.endsWith('.eth')) {
      return reject(new Error(`"${input}" is neither an Ethereum address or ENS name (ends in .eth).`))
    }

    // check ENS...
    store.dispatch('resolveENS', input)
      .then(addr => {
        if (!addr) {
          reject(new Error(`"${input}" does not resolve to an Ethereum address`))
        }
        resolve(addr)
      })
      .catch(reject)
  })
}

/*
 * format splits for contract method input (no dripFraction :)
 * @param splits [{ address, percent }]
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

export function validateSplits (splits, provider) {
  splits = splits || []
  const validate = async () => {
    // validate each address...
    for (var i = 0; i < splits.length; i++) {
      if (!utils.isAddress(splits[i][0])) {
        // !! not an ENS
        if (!splits[i][0].endsWith('.eth')) {
          throw new Error(`Invalid recipient: "${splits[i][0]}" is not an Ethereum address or ENS name (must end in .eth).`)
        }
        // resolve ENS name...
        const address = await provider.resolveName(splits[i][0])

        if (!address) {
          throw new Error(`Invalid recipient: "${splits[i][0]}" does not resolve to an Ethereum address.`)
        }

        // replace ens with address
        splits[i][0] = address
      }
    }

    return splits
  }

  return new Promise((resolve, reject) => validate().then(resolve).catch(reject))
}

export function getDripPctFromAmts (amts) {
  if (!amts) return 0
  const sum = amts[0].add(amts[1])
  const pct = (amts[1].toString() / sum.toString()) * 100 // dumb javascript
  return pct > 0 && pct < 0.01 ? '>0' : parseFloat(pct.toFixed(2))
}

export const getDripsWithdrawable = (config) => {
  // https://discord.com/channels/841318878125490186/875668327614255164/918094059732623411
  // - Look at the latest user's DripsUpdated, it has a timestamp, uint128 balance and DripsReceiver[] receivers
  // - Add up all the receiers' amtPerSec, it's totalAmtPerSec
  // - withdrawable = eventBalance - (currTimestamp - eventTimestamp) * totalAmtPerSec
  // - if withdrawable < 0, withdrawable = eventBalance % totalAmtPerSec
  try {
    const currTimestamp = Math.floor(new Date().getTime() / 1000) // sec
    const totalAmtPerSec = config.receivers.reduce((acc, curr) => acc.add(curr.amtPerSec), bn.from(0))
    const eventBalance = bn.from(config.balance)
    let withdrawable = eventBalance.sub(totalAmtPerSec.mul(currTimestamp - config.timestamp))
    if (withdrawable.lt(0)) {
      withdrawable = eventBalance.mod(totalAmtPerSec)
    }
    return withdrawable
  } catch (e) {
    console.error(e)
    return null
  }
}

/* export const getDripsWithdrawableFromEvent = async (event) => {
  // https://discord.com/channels/841318878125490186/875668327614255164/918094059732623411
  // - Look at the latest user's DripsUpdated, it has a timestamp, uint128 balance and DripsReceiver[] receivers
  // - Add up all the receiers' amtPerSec, it's totalAmtPerSec
  // - withdrawable = eventBalance - (currTimestamp - eventTimestamp) * totalAmtPerSec
  // - if withdrawable < 0, withdrawable = eventBalance % totalAmtPerSec
  try {
    const currTimestamp = Math.floor(new Date().getTime() / 1000) // sec
    const eventTimestamp = (await event.getBlock()).timestamp // sec
    const receivers = event.args[2]
    const totalAmtPerSec = receivers.reduce((acc, curr) => acc.add(curr[1]), bn.from(0))
    const eventBalance = event.args[1]
    let withdrawable = eventBalance.sub(totalAmtPerSec.mul(currTimestamp - eventTimestamp))
    if (withdrawable.lt(0)) {
      withdrawable = eventBalance.mod(totalAmtPerSec)
    }
    return withdrawable
  } catch (e) {
    console.error(e)
    return null
  }
} */

export const filterForCurrentEvents = events => {
  const currentEvents = []
  events.reverse().forEach(event => {
    // add event if sender hasn't been added
    if (!currentEvents.find(e => e.args[0] === event.args[0])) {
      currentEvents.push(event)
    }
  })
  return currentEvents
}

// format drip events for DripRow.vue
export const formatDripsEvents = events => {
  return events.map(e => {
    const totalAmtPerSec = e.args[2].reduce((acc, cur) => acc.add(cur[1]), bn.from(0))
    return {
      blockNumber: e.blockNumber,
      sender: e.args[0],
      receiver: e.args[2].map(rec => rec[0]),
      amount: toDAIPerMo(totalAmtPerSec)
    }
  })
}

// format split events for DripRow.vue
export const formatSplitsEvents = events => {
  return events.map(e => {
    let percent = e.args[1].reduce((acc, cur) => acc + cur[1], 0) / store.state.splitsFractionMax * 100
    percent = percent > 0 && !parseInt(percent) ? '<1%' : parseInt(percent) // parseFloat(percent.toFixed(2))
    return {
      blockNumber: e.blockNumber,
      sender: e.args[0],
      receiver: e.args[1].map(rec => rec[0]),
      percent
    }
  })
}
