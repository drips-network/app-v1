import { BigNumber as bn, constants } from 'ethers'

export const fromWei = (wei) => {
  wei = bn.isBigNumber(wei) ? wei : bn.from(wei)
  return wei.div(constants.WeiPerEther)
}

export const toWei = (dai) => {
  return constants.WeiPerEther.mul(dai)
}
