import RadicleRegistryABI from './RadicleRegistry.json'
import FundingNFTABI from './FundingNFT.json'
import DAIABI from './Dai.json'
import DIAPoolABI from './DaiPool.json'
const deploy = JSON.parse(process.env.VUE_APP_CONTRACTS_DEPLOY)

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
