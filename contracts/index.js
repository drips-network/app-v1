import RadicleRegistryABI from './RadicleRegistry.json'
const deploy = JSON.parse(process.env.VUE_APP_CONTRACTS_DEPLOY)

export const RadicleRegistry = {
  address: deploy.CONTRACT_RADICLE_REGISTRY,
  abi: RadicleRegistryABI
}
