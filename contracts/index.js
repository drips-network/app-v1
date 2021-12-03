import RadicleRegistryABI from './RadicleRegistry.json'
import DripsTokenABI from './DripsToken.json'
import DaiABI from './Dai.json'
import DaiDripsHubABI from './DaiDripsHub.json'

export const deploy = JSON.parse(`
{
  "NAME" : "8th Rinkeby Deployment",
  "CONTRACT_DAI": "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
  "CONTRACT_DRIPS_HUB": "0xb4293691053EbE933989515e86ff800542b0D033",
  "CONTRACT_RADICLE_REGISTRY": "0x2AD4fFD1A3a5756e68FeDaE6F1bF445565cb4ee4",
  "CONTRACT_BUILDER": "0x48A3D42F0050074ABd49FDdf222a38D92f70efE5",
  "NETWORK": "rinkeby",
  "DEPLOY_ADDRESS": "eca823848221a1da310e1a711e19d82f43101b07",
  "CYCLE_SECS": "86400",
  "COMMIT_HASH": "2171091612fb152bdc0cc20c0ee607f12c3badc2",
  "GOVERNANCE_ADDRESS": "0xeca823848221a1da310e1a711e19d82f43101b07"
}
`)

export const RadicleRegistry = {
  address: deploy.CONTRACT_RADICLE_REGISTRY,
  abi: RadicleRegistryABI
}

export const DripsToken = {
  // address: ...from each project
  abi: DripsTokenABI
}

export const DAI = {
  address: deploy.CONTRACT_DAI,
  abi: DaiABI
}

export const DaiDripsHub = {
  address: deploy.CONTRACT_DRIPS_HUB,
  abi: DaiDripsHubABI
}
