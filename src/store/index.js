import { createStore } from 'vuex'
//
import { ethers as Ethers } from 'ethers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
// contracts
import { RadicleRegistry } from '../../contracts'

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
  // modules: { },
  state () {
    return {
      address: null,

      RadicleRegistryContract: null
    }
  },
  getters: {
    addrShort: () => (addr) => addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : '...'
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

    async createProject ({ state, dispatch }, { project, projectMeta }) {
      // let ipfsHash
      try {
        // ensure wallet connected
        if (!state.address) {
          await dispatch('connect')
        }

        // save full data to IPFS/pinata...
        const projectFull = { ...project, ...projectMeta }
        const ipfsHash = await pinJSONToIPFS(projectFull)
        console.log('project meta:', `https://gateway.pinata.cloud/ipfs/${ipfsHash}`)
        project = { ipfsHash, ...project }

        // create project on chain
        const tx = await newProject(project)
        console.log('new project tx:', tx)

        return { tx, ipfsHash }
      } catch (e) {
        console.error('@createProject', e)
        throw e
      }
    },

    waitForProjectCreate (_, { txFrom }) {
      const contract = getRadicleRegistryContract()
      return new Promise((resolve) => {
        // listener
        const onNewProject = (projectContractAddress) => {
          console.log('@NewProject', projectContractAddress)
          contract.off('NewProject', onNewProject)
          return resolve(projectContractAddress)

          // TODO: filter by owner? (event just returns address right now...)
          // console.log('ev', event)
          // const eventFrom = (await event.getTransaction()).from
          // // if matches sender...
          // if (eventFrom.toLowerCase() === txFrom.toLowerCase()) {
          //   console.log('matches owner...')
          //   // unlisten!
          //   contract.off('NewProject', onNewProject)
          //   console.log('unlisten!')
          //   return resolve(event)
          // }
        }

        // listen!
        console.log('listen for new project...')
        contract.on('NewProject', onNewProject)
      })
    },

    // async waitForTx (_, txHash) {
    //   return provider.waitForTransaction(txHash)
    // },

    async getEventLog () {
      const contract = getRadicleRegistryContract()
      const events = await contract.queryFilter('NewProject')
      console.log('new project events:', events)
    }
  }
})

// helpers

function getRadicleRegistryContract () {
  return new Ethers.Contract(RadicleRegistry.address, RadicleRegistry.abi, provider)
}

function newProject ({ name, owner, symbol, ipfsHash }) {
  let contract = getRadicleRegistryContract()
  contract = contract.connect(signer)
  console.log('new project...', arguments)
  return contract.newProject(name, symbol, owner, ipfsHash)
}

async function pinJSONToIPFS (json) {
  let resp = await fetch('/.netlify/functions/pin', {
    method: 'POST',
    body: JSON.stringify(json)
  })
  resp = await resp.json()
  return resp.IpfsHash
}

// should have some sort of owner auth...
// async function unpinFromIPFS (hash) {
//   let resp = await fetch(`/.netlify/functions/unpin?hash=${hash}`)
//   return await resp.json()
// }
