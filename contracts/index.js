import RadicleRegistryABI from './RadicleRegistry.json'
import DripsTokenABI from './DripsToken.json'
import DaiABI from './Dai.json'
import DaiDripsHubABI from './DaiDripsHub.json'

export const deploy = JSON.parse(`
{
  "CONTRACT_DAI": "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
  "CONTRACT_DRIPS_HUB": "0x1B17603598e212faAc2407Fae4beD2EbD60Bdd9F",
  "CONTRACT_DRIPS_HUB_LOGIC": "0x04DCAD8d8d79F0Ef386859669e66F1a33152c2E1",
  "CONTRACT_RESERVE": "0x34751937b3afA8926E2F55b1D0B76BDA0a059932",
  "CONTRACT_RADICLE_REGISTRY": "0x2be26e0311B7c54b1c89Daf3B8269B2BcBb77eB0",
  "CONTRACT_BUILDER": "0xD506bE10087d45e6269739529BA64D72035b376f",
  "NETWORK": "optimism-kovan",
  "DEPLOY_ADDRESS": "0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d",
  "CYCLE_SECS": "604800",
  "COMMIT_HASH": "67907365faf238e61213f07b01be333c9f03836e",
  "GOVERNANCE_ADDRESS": "0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d",
  "CONTRACT_DRIPS_GOVERNANCE": "0xf0069Ef8e48ECA9Ae0E1e62c20Af02e947F60c03"
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
