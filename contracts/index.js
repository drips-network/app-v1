import RadicleRegistryABI from './RadicleRegistry.json'
import DripsTokenABI from './DripsToken.json'
import DaiABI from './Dai.json'
import DaiDripsHubABI from './DaiDripsHub.json'
import MetadataABI from './MetaData.json'

export const deploy = JSON.parse(import.meta.env.VITE_APP_CONTRACTS_DEPLOY)

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

export const Metadata = {
  address: deploy.CONTRACT_METADATA,
  abi: MetadataABI
}
