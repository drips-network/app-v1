import { createStore } from 'vuex'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'

let provider, signer, walletProvider

const networks = {
  mainnet: { id: 1, infura: 'wss://mainnet.infura.io/ws/v3/1cf5614cae9f49968fe604b818804be6' },
  rinkeby: { id: 4, infura: 'wss://rinkeby.infura.io/ws/v3/1cf5614cae9f49968fe604b818804be6' }
}

// provider options
const providerOptions = {
  /* See Provider Options Section */
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: '1cf5614cae9f49968fe604b818804be6' // required
    }
  }
}

// setup web3 modal
const web3Modal = new Web3Modal({
  network: 'rinkeby', // optional
  cacheProvider: true, // optional
  providerOptions // required
  // theme: 'dark'
})

export default createStore({
  // modules: {},
  state () {
    return {
      address: null,
      networkId: null
    }
  },
  mutations: {
    SIGN_IN (state, address) {
      state.address = address
    },
    SIGN_OUT (state) {
      state.address = null
    },
    SET_NETWORK (state, id) {
      state.networkId = id
      console.log('network:', id)
    }
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

        const networkId = (await provider.getNetwork()).chainId
        commit('SET_NETWORK', networkId)

        // listen to provider events
        // dispatch('listenToWalletProvider')
      } catch (e) {
        console.error('@init', e)
      }
    },

    async setupFallbackProvider ({ dispatch }) {
      try {
        if (window.ethereum) {
          // metamask...
          provider = new ethers.providers.Web3Provider(window.ethereum)
        } else {
          // infura
          const n = process.env.NODE_ENV === 'development' ? 'rinkeby' : 'mainnet'
          provider = new ethers.getDefaultProvider(networks[n].infura)
        }
        console.log('fallback provider')
      } catch (e) {
        console.error(e)
      }
    },

    /* connect wallet */
    async connect ({ commit, dispatch }) {
      try {
        // connect and update provider, signer
        walletProvider = await web3Modal.connect()
        provider = new ethers.providers.Web3Provider(walletProvider)
        signer = provider.getSigner()

        // set user address
        const address = await signer.getAddress()
        commit('SIGN_IN', address)

        // set network id
        const networkId = (await provider.getNetwork()).chainId
        commit('SET_NETWORK', networkId)

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
      if (walletProvider) {
        walletProvider.off('accountsChanged')
        walletProvider.off('disconnect')
      }
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
    }
  }
})
