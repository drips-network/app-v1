import RadicleRegistryABI from './RadicleRegistry.json'
import DripsTokenABI from './DripsToken.json'
import DaiABI from './Dai.json'
import DaiDripsHubABI from './DaiDripsHub.json'

export const deploy = JSON.parse(`
{
  "CONTRACT_DAI": "0x58174FD50bbE06E06be33e09A1f39b91212d7CC1",
  "CONTRACT_DRIPS_HUB": "0x6FfBd10513f06253aFB298F0f7b7974693C1A8AB",
  "CONTRACT_DRIPS_HUB_LOGIC": "0xB83E88EdB4FBc138ED2F2d1FdFE7eb727e8B466f",
  "CONTRACT_RESERVE": "0x4810B06b748033483B27Cb9C6052356433d5dA95",
  "CONTRACT_RADICLE_REGISTRY": "0xA709BaCA50C5f4D2CEec4a23B7cf0f341A2d3465",
  "CONTRACT_BUILDER": "0x2DB33C0c4ddf4e68A007a1eFB4C552b059c75999",
  "NETWORK": "polygon-mumbai",
  "DEPLOY_ADDRESS": "0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d",
  "CYCLE_SECS": "604800",
  "COMMIT_HASH": "866e44f02c600af7a8fd557b76310254f20af3b2",
  "GOVERNANCE_ADDRESS": "0x341a08926dCa7fa7D135F96E4d76b696e5f6d38d",
  "CONTRACT_DRIPS_GOVERNANCE": "0xba4dE5465715351b6A674189B3B6FCC0Cb1044b9"
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
