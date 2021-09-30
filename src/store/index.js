import { createStore } from "vuex"
// web3
import Web3 from 'web3'
// import Web3Modal from 'web3modal'
// import WalletConnectProvider from '@walletconnect/web3-provider'

const networks = {
  mainnet: { id: 1, infura: 'wss://mainnet.infura.io/ws/v3/1cf5614cae9f49968fe604b818804be6' },
  rinkeby: { id: 4, infura: 'wss://rinkeby.infura.io/ws/v3/1cf5614cae9f49968fe604b818804be6' }
}

// provider options
const providerOptions = {
  /* See Provider Options Section */
  // walletconnect: {
  //   package: WalletConnectProvider, // required
  //   options: {
  //     infuraId: '1cf5614cae9f49968fe604b818804be6' // required
  //   }
  // }
}

// setup web3 modal
// const web3Modal = new Web3Modal({
//   // network: 'rinkeby', // optional
//   cacheProvider: true, // optional
//   providerOptions // required
// })

export const store = createStore({
  // modules: {},
  // state () {
  //   return {
  //     address: null,
  //     networkId: null,  
  //   }
  // },
  // mutations: {
  //   SIGN_IN (state, address) {
  //     state.address = address
  //   },
  //   SIGN_OUT (state) {
  //     state.address = null
  //   },
  //   SET_NETWORK (state, id) {
  //     state.networkId = id
  //   },
  // },
  // actions: {
  //   /* setup web3, contracts */
  //   async init ({ state, commit, dispatch }) {
  //     try {
  //       // auto-connect?
  //       if (web3Modal.cachedProvider) {
  //         await dispatch('connect')
  //       }

  //       // setup web3
  //       if (!web3) {
  //         if (provider) {
  //           web3 = new Web3(provider)
  //         } else {
  //           // const n = process.env.NODE_ENV === 'development' ? 'rinkeby' : 'mainnet'
  //           // web3 = new Web3(new Web3.providers.WebsocketProvider(networks[n].infura))
  //           console.warn('no fallback provder set!')
  //         }
  //       }

  //       // setup contracts
  //       const networkId = state.networkId || await web3.eth.net.getId() || networks.mainnet.id
  //       console.log('network:', networkId)
  //       commit('SET_NETWORK', networkId)
  //       // commit('SET_CONTRACTS', { web3, networkId })

  //       // listen to provider events
  //       dispatch('listenToProvider')
  //     } catch (e) {
  //       console.error('@init', e)
  //     }
  //   },

  //   /* connect wallet */
  //   async connect ({ commit, dispatch }) {
  //     try {
  //       // connect and update provider, web3
  //       provider = await web3Modal.connect()
  //       web3 = new Web3(provider)
  //       // save account
  //       const accounts = await web3.eth.getAccounts()
  //       const address = accounts[0]
  //       const networkId = await web3.eth.net.getId()
  //       // const chainId = await web3.eth.chainId(); // not a function??
  //       commit('SIGN_IN', address)
  //       commit('SET_NETWORK', networkId)
  //     } catch (e) {
  //       console.error('@connect', e)
  //       // clear in case
  //       web3Modal.clearCachedProvider()
  //     }
  //   },

  //   /* disconnect wallet */
  //   disconnect ({ commit }) {
  //     // clear so they can re-select from scratch
  //     web3Modal.clearCachedProvider()
  //     // provider.off('accountsChanged')
  //     // provider.off('disconnect')
  //     commit('SIGN_OUT')
  //   },

  //   /* wallet events */
  //   listenToProvider ({ commit, dispatch }) {
  //     if (!provider?.on) return

  //     // account changed (or disconnected)
  //     provider.on('accountsChanged', accounts => {
  //       console.log('accountsChanged', accounts)
  //       if (!accounts.length) {
  //         return dispatch('disconnect')
  //       }
  //       commit('SIGN_IN', accounts[0])
  //     })

  //     // changed network
  //     provider.on('chainChanged', chainId => {
  //       console.log('network changed', chainId)
  //       // reload page so data is correct...
  //       window.location.reload()
  //     })

  //     // random disconnection? (doesn't fire on account disconnect)
  //     provider.on('disconnect', error => {
  //       console.error('disconnected?', error)
  //       dispatch('disconnect')
  //     })
  //   },
  // }
})