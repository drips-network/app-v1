import { createStore } from 'vuex'

// web3
import { ethers } from 'ethers'
// import Web3 from 'web3'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'

let provider, signer

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
  cacheProvider: false, // optional
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
        // dispatch('listenToProvider')
      } catch (e) {
        console.error('@init', e)
      }
    },

    async setupFallbackProvider () {
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
        provider = await web3Modal.connect()
        provider = new ethers.providers.Web3Provider(provider)
        signer = provider.getSigner()

        // set user address
        const address = await signer.getAddress()
        commit('SIGN_IN', address)

        // set network id
        const networkId = (await provider.getNetwork()).chainId
        commit('SET_NETWORK', networkId)
      } catch (e) {
        console.error('@connect', e)
        // clear in case
        web3Modal.clearCachedProvider()
      }
    },

    /* disconnect wallet */
    disconnect ({ commit, dispatch }) {
      // clear so they can re-select from scratch
      web3Modal.clearCachedProvider()
      // provider.off('accountsChanged')
      // provider.off('disconnect')
      commit('SIGN_OUT')

      dispatch('setupFallbackProvider')
    }

    /* wallet events */
    // listenToProvider ({ commit, dispatch }) {
    //   if (!provider?.on) return

    //   // account changed (or disconnected)
    //   provider.on('accountsChanged', accounts => {
    //     console.log('accountsChanged', accounts)
    //     if (!accounts.length) {
    //       return dispatch('disconnect')
    //     }
    //     commit('SIGN_IN', accounts[0])
    //   })

    //   // changed network
    //   provider.on('chainChanged', chainId => {
    //     console.log('network changed', chainId)
    //     // reload page so data is correct...
    //     window.location.reload()
    //   })

    //   // random disconnection? (doesn't fire on account disconnect)
    //   provider.on('disconnect', error => {
    //     console.error('disconnected?', error)
    //     dispatch('disconnect')
    //   })
    // },
  }
})
