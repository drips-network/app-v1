import RadicleRegistryABI from './RadicleRegistry.json'
import FundingNFTABI from './FundingNFT.json'
import DAIABI from './Dai.json'
import DIAPoolABI from './DaiPool.json'

export const deploy = JSON.parse(`
{
  "NAME": "6th Rinkeby Deployment",
  "CONTRACT_DAI": "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
  "CONTRACT_FUNDING_POOL": "0xA7010F93ecd465cE26c804dF20bd671D32B3cf18",
  "CONTRACT_RADICLE_REGISTRY": "0xa5a37BAC49E2B4993905d0E33b112fA2aC16183d",
  "CONTRACT_BUILDER": "0xfBDB1136630387667163f48028A9f544C1f96d15",
  "NETWORK": "rinkeby",
  "DEPLOY_ADDRESS": "eca823848221a1da310e1a711e19d82f43101b07",
  "CYCLE_SECS": "86400",
  "COMMIT_HASH": "39467779ecb0f0df0b924463619be011fc58fc76",
  "GOVERNANCE_ADDRESS": "0xeCa823848221a1DA310E1a711E19D82F43101B07"
}
`)

export const RadicleRegistry = {
  address: deploy.CONTRACT_RADICLE_REGISTRY,
  abi: RadicleRegistryABI
}

export const FundingNFT = {
  // address: ...from each project
  abi: FundingNFTABI
}

export const DAI = {
  address: deploy.CONTRACT_DAI,
  abi: DAIABI
}

export const DAIPool = {
  address: deploy.CONTRACT_FUNDING_POOL,
  abi: DIAPoolABI
}
