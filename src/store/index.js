import { createStore } from 'vuex'
//
import { ethers as Ethers } from 'ethers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
// contracts
import { RadicleRegistry } from '../../contracts'
// modules
import create from './create.js'

let provider, signer, walletProvider

const network = JSON.parse(process.env.VUE_APP_CONTRACTS_DEPLOY).NETWORK
const networks = {
  mainnet: { id: 1, infura: 'wss://mainnet.infura.io/ws/v3/1cf5614cae9f49968fe604b818804be6' },
  rinkeby: { id: 4, infura: 'wss://rinkeby.infura.io/ws/v3/1cf5614cae9f49968fe604b818804be6' }
}

// setup web3 modal
const web3Modal = new Web3Modal({
  network, // optional
  cacheProvider: true, // optional
  providerOptions: { // required
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: '1cf5614cae9f49968fe604b818804be6' // required
      }
    }
  },
  theme: 'dark'
})

export default createStore({
  modules: { create },
  state () {
    return {
      address: null,

      RadicleRegistryContract: null
    }
  },
  mutations: {
    SIGN_IN (state, address) {
      state.address = address
    },
    SIGN_OUT (state) {
      state.address = null
    }
    // SET_CONTRACTS (state, provider) {
    //   console.log('registry', RadicleRegistry.address)
    //   state.RadicleRegistryContract = new Ethers.Contract(RadicleRegistry.address, RadicleRegistry.abi, provider)
    // }
  },
  actions: {
    /* setup web3, contracts */
    async init ({ state, commit, dispatch }) {
      try {
        // auto-connect?
        if (web3Modal.cachedProvider) {
          await dispatch('connect')
        }

        // setup ethers ?
        if (!provider) {
          await dispatch('setupFallbackProvider')
        }

        // const network = await provider.getNetwork()
        // console.log(network.name)
      } catch (e) {
        console.error('@init', e)
      }
    },

    async setupFallbackProvider ({ commit, dispatch }) {
      try {
        if (window.ethereum) {
          // metamask...
          provider = new Ethers.providers.Web3Provider(window.ethereum)
        } else {
          // infura...
          provider = new Ethers.getDefaultProvider(networks[network].infura)
        }

        // commit('SET_CONTRACTS', provider)
      } catch (e) {
        console.error(e)
      }
    },

    /* connect wallet */
    async connect ({ state, commit, dispatch }) {
      try {
        // connect and update provider, signer
        walletProvider = await web3Modal.connect()
        const provider = new Ethers.providers.Web3Provider(walletProvider)
        signer = provider.getSigner()

        // set user address
        const address = await signer.getAddress()
        commit('SIGN_IN', address)

        // commit('SET_CONTRACTS', provider)

        dispatch('listenToWalletProvider')
      } catch (e) {
        console.error('@connect', e)
        // clear in case
        dispatch('disconnect')
      }
    },

    /* disconnect wallet */
    disconnect ({ commit, dispatch }) {
      // clear so they can re-select from scratch
      web3Modal.clearCachedProvider()
      // if (walletProvider.off) {
      //   walletProvider.off('accountsChanged')
      //   walletProvider.off('disconnect')
      // }
      commit('SIGN_OUT')

      dispatch('setupFallbackProvider')
    },

    /* wallet events */
    listenToWalletProvider ({ commit, dispatch }) {
      if (!walletProvider?.on) return

      // account changed (or disconnected)
      walletProvider.on('accountsChanged', accounts => {
        console.log('accountsChanged', accounts)
        if (!accounts.length) {
          return dispatch('disconnect')
        }
        commit('SIGN_IN', accounts[0])
      })

      // changed network
      walletProvider.on('chainChanged', chainId => {
        console.log('network changed', chainId)
        // reload page so data is correct...
        window.location.reload()
      })

      // random disconnection? (doesn't fire on account disconnect)
      walletProvider.on('disconnect', error => {
        console.error('disconnected?', error)
        dispatch('disconnect')
      })
    },

    // async getProvider () {
    //   if (!provider) await dispatch('setupFallbackProvider')
    //   return provider
    // },

    // async getSigner ({ dispatch }) {
    //   if (!signer) await dispatch('connect')
    //   return signer
    // },

    async newProject ({ state }, { name, symbol, minAmount }) {
      try {
        let contract = new Ethers.Contract(RadicleRegistry.address, RadicleRegistry.abi, provider)
        contract = contract.connect(signer)
        console.log('new project...', name, symbol, state.address, minAmount)
        const resp = await contract.newProject(name, symbol, state.address, minAmount)
        console.log(resp)
      } catch (e) {
        console.error('@newProject', e)
      }
    }

    // async getEventLog() {
    //   const contract = new Ethers.Contract(RadicleRegistry.address, RadicleRegistry.abi, provider)
    //   const events = await contract.queryFilter('NewProject')
    //   console.log(events)
    //   events.forEach(async event => {
    //     console.log(await event.decode())
    //   })
    // }
  }
})
