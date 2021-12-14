import RadicleRegistryABI from './RadicleRegistry.json'
import DripsTokenABI from './DripsToken.json'
import DaiABI from './Dai.json'
import DaiDripsHubABI from './DaiDripsHub.json'

export const deploy = JSON.parse(`
{
    "NAME": "Radicle Drips Mainnet Deployment v0.1",
    "CONTRACT_DAI": "0x6b175474e89094c44da98b954eedeac495271d0f",
    "CONTRACT_DRIPS_HUB": "0x73043143e0a6418cc45d82d4505b096b802fd365",
    "CONTRACT_DRIPS_HUB_LOGIC": "0x8d321e80487356c846f34456d31ce761776ef697",
    "CONTRACT_RESERVE": "0xf9bbb2df44cfe46e501cf91c99b2f8fef9d9d44a",
    "CONTRACT_RADICLE_REGISTRY": "0x40e9340BE9326b2e026fDBEfe775F1515939bD46",
    "CONTRACT_BUILDER": "0x058be54b173e324f80ec03672ec14c4d079b82ac",
    "NETWORK": "mainnet",
    "DEPLOY_ADDRESS": "0xAbadeFE1CE7bB6f1D5146f3f476701F791b18c6C",
    "CYCLE_SECS": "2592000",
    "COMMIT_HASH": "d47193a8d282f0e91e048bc39aeca0f8fe954458",
    "GOVERNANCE_ADDRESS": "0x8da8f82d2bbdd896822de723f55d6edf416130ba",
    "CONTRACT_DRIPS_GOVERNANCE": "0x1bc6075d1b811f0f0c0913ac7a3ac1d3d01a8b6f",
  "CONTRACT_TOKEN_TEMPLATE": "0x885e158c7e6605c895e014116661651b22770f7b"
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
