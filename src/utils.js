import { BigNumber as bn, constants, utils } from 'ethers'

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

export const toWeiPerSec = (dai) => {
  // warning! BN will clip off the decimal...
  // (but maybe good for when setting minAmtPerSec)
  return utils.parseUnits(dai.toString()).div(30 * 24 * 60 * 60)
}
