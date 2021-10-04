import { RadicleRegistry } from '../../contracts'

export default {
  namespaced: true,
  actions: {
    async newProject ({ dispatch, rootState }) {
      const signer = await dispatch('getSigner', null, { root: true })
      if (signer) {
        const contract = rootState.RadicleRegistryContract.connect(signer)
        contract.newProject({
          name: 'test'
        })
      }
    }
  }
}
