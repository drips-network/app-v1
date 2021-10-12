import { createStore } from 'vuex'
//
import { ethers as Ethers } from 'ethers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
// contracts
import { RadicleRegistry, DAI, FundingNFT } from '../../contracts'

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
      state.address = address.toLowerCase()
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
    /* setup provider */
    async init ({ state, commit, dispatch }) {
      try {
        // auto-connect?
        if (web3Modal.cachedProvider) {
          await dispatch('connect')
        }

        // fallback provider
        if (!provider) {
          if (window.ethereum) {
            // metamask
            provider = new Ethers.providers.Web3Provider(window.ethereum)
          } else {
            // infura
            provider = new Ethers.getDefaultProvider(networks[network].infura)
          }
        }
      } catch (e) {
        console.error('@init', e)
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
        project.ipfsHash = ipfsHash

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
        const onNewProject = async (projectAddress, projectOwner) => {
          console.log('@NewProject', projectAddress, projectOwner)

          // if owner matches tx sender...
          if (projectOwner.toLowerCase() === txFrom.toLowerCase()) {
            contract.off('NewProject', onNewProject)
            return resolve(projectAddress)
          }
        }

        // listen!
        console.log('listen for new project...')
        contract.on('NewProject', onNewProject)
      })
    },

    async addProjectNFTType (_, { projectAddress, typeId = 0, limit = 999, minAmtPerSec = 0 }) {
      const contract = getProjectContract(projectAddress)
      const contractSigner = contract.connect(signer)
      return contractSigner.addType(typeId, limit, minAmtPerSec)
    },

    async getEventLog () {
      const contract = getRadicleRegistryContract()
      const events = await contract.queryFilter('NewProject')
      console.log('new project events:', events)
    },

    async getProjectMeta ({ dispatch }, projectAddress) {
      if (!provider) {
        await dispatch('init')
      }
      try {
        // get hash...
        const contract = new Ethers.Contract(projectAddress, FundingNFT.abi, provider)
        const ipfsHash = await contract.contractURI()
        // fetch...
        const resp = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`)
        const meta = resp.json()
        return meta
      } catch (e) {
        console.error('@getProjectMeta', e)
        throw e
      }
    },

    async approveDAIContract ({ state }, { projectAddress, amount }) {
      // TODO: check existing DAI allowance
      // const contract = new Ethers.Contract(DAI.address, DAI.abi, provider)
      // await contract.allowance(state.address, projectAddress)

      try {
        const contract = new Ethers.Contract(DAI.address, DAI.abi, provider)
        const contractSigner = contract.connect(signer)
        const tx = await contractSigner.approve(projectAddress, amount.toString())
        return tx
      } catch (e) {
        console.error('@approveDAIContract', e)
      }
    },

    async mintProjectNFT ({ state }, { projectAddress, typeId = 0, topUpAmt, amtPerSec }) {
      const contract = new Ethers.Contract(projectAddress, FundingNFT.abi, provider)
      const contractSigner = contract.connect(signer)

      try {
        const tx = await contractSigner.mint(state.address, typeId, topUpAmt.toString(), amtPerSec.toString())
        return tx
      } catch (e) {
        console.error('@mintProjectNFT', e)
        throw e
      }
    },

    async waitForNFTMint ({ state }, { projectAddress }) {
      const contract = getProjectContract(projectAddress)

      return new Promise((resolve) => {
        // listener
        const onNewNFT = async (newTokenId, nftReceiver, typeId, topUpAmt, amtPerSec) => {
          const nft = {
            tokenId: newTokenId.toString(),
            nftReceiver,
            projectAddress,
            typeId: typeId.toString(),
            topUpAmt: typeId.toString(),
            amtPerSec: amtPerSec.toString()
          }
          console.log('@NewNFT', nft)

          // if owner matches tx sender...
          if (nftReceiver.toLowerCase() === state.address.toLowerCase()) {
            contract.off('NewNFT', onNewNFT)
            return resolve(nft)
          }
        }

        // listen!
        console.log('listen for new NFT...')
        contract.on('NewNFT', onNewNFT)
      })
    }
  }
})

// helpers

function getRadicleRegistryContract () {
  return new Ethers.Contract(RadicleRegistry.address, RadicleRegistry.abi, provider)
}

function getProjectContract (address) {
  return new Ethers.Contract(address, FundingNFT.abi, provider)
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
