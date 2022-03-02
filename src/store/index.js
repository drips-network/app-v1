import { createStore } from 'vuex'
import { toRaw } from 'vue'
import { ethers as Ethers, BigNumber as bn } from 'ethers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import api, { queryProjectMeta, queryProject, queryDripsConfigByID, querySplitsBySender, querySplitsByReceiver, queryDripsByReceiver } from '@/api'
import { oneMonth, toWei, validateSplits, getDripsWithdrawable } from '@/utils'
import label from '@/labels'
// contracts
import { deploy, RadicleRegistry, DAI, DripsToken, DaiDripsHub } from '../../contracts'

let provider, signer, walletProvider

const networks = {
  1: { name: 'mainnet', layer: 'ethereum', infura: 'wss://mainnet.infura.io/ws/v3/1cf5614cae9f49968fe604b818804be6', explorer: { name: 'Etherscan', domain: 'https://etherscan.io' } },
  4: { name: 'rinkeby', layer: 'ethereum', infura: 'wss://rinkeby.infura.io/ws/v3/1cf5614cae9f49968fe604b818804be6', explorer: { name: 'Etherscan', domain: 'https://rinkeby.etherscan.io' } },
  137: { name: 'polygon', layer: 'polygon', infura: 'https://polygon-mainnet.infura.io/v3/1cf5614cae9f49968fe604b818804be6', explorer: { name: 'Polyscan', domain: 'https://polygonscan.com' } },
  80001: { name: 'polygon-mumbai', layer: 'polygon', infura: 'https://polygon-mumbai.infura.io/v3/1cf5614cae9f49968fe604b818804be6', explorer: { name: 'Polyscan', domain: 'https://mumbai.polygonscan.com' } }
}
const deployNetworkName = JSON.parse(process.env.VUE_APP_CONTRACTS_DEPLOY).NETWORK || 'mainnet'
const deployNetwork = Object.values(networks).find(n => n.name === deployNetworkName)

// setup web3 modal
const web3Modal = new Web3Modal({
  network: deployNetwork.name, // optional
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

let initializing = false

export default createStore({
  // modules: { },
  state () {
    return {
      networkId: null,
      address: null,
      addresses: {},

      // TODO - get this from the contract?
      splitsFractionMax: 1000000
    }
  },
  getters: {
    network: () => deployNetwork,
    addrShort: (state) => (addr) => {
      // return ENS name or shortened 0x8888...8888
      return state.addresses[addr]?.ens ? state.addresses[addr].ens
        : addr ? addr.slice(0, 6).toLowerCase() + '...' + addr.slice(-4).toLowerCase() : '...'
    },
    isWalletAddr: (state) => (addr) => addr === state.address,
    isWrongNetwork: state => state.networkId && networks[state.networkId]?.name !== deployNetwork.name,
    isPolygon: state => networks[state.networkId]?.layer === 'polygon',
    label: state => name => label(name, deployNetwork?.layer)
  },
  mutations: {
    SIGN_IN (state, address) {
      state.address = address.toLowerCase()
    },
    SIGN_OUT (state) {
      state.address = null
    },
    SAVE_ADDRESS (state, { address, ens }) {
      state.addresses[address.toLowerCase()] = { ens, records: {} }
    },
    SAVE_ADDRESS_RECORD (state, { address, record }) {
      state.addresses[address].records[record.name] = record.value
    },
    SET_NETWORK_ID (state, id) {
      state.networkId = id
    }
    // SET_CONTRACTS (state, provider) {
    //   console.log('registry', RadicleRegistry.address)
    //   state.RadicleRegistryContract = new Ethers.Contract(RadicleRegistry.address, RadicleRegistry.abi, provider)
    // }
  },
  actions: {
    /* setup provider */
    async init ({ state, commit, dispatch }) {
      // de-dupe
      if (initializing) {
        return initializing
      }

      const setup = async () => {
        try {
          // auto-connect?
          if (web3Modal.cachedProvider) {
            await dispatch('connect')
          }

          // fallback provider
          if (!provider) {
            await dispatch('setupFallbackProvider')
          }

          initializing = false
        } catch (e) {
          console.error('@init', e)
          initializing = false
          throw e
        }
      }

      // create a promise for the handler
      initializing = new Promise((resolve, reject) => setup().then(resolve).catch(reject))

      return initializing
    },

    async setupFallbackProvider ({ dispatch }) {
      try {
        if (window.ethereum) {
          // metamask/browser
          provider = new Ethers.providers.Web3Provider(window.ethereum)
        } else {
          // infura fallback
          provider = new Ethers.getDefaultProvider(deployNetwork.infura)
        }
        // set network
        await dispatch('getNetworkId', provider)
        return true
      } catch (e) {
        console.error(e)
      }
    },

    getNetworkId ({ commit }, provider) {
      return provider.getNetwork()
        .then(network => commit('SET_NETWORK_ID', network.chainId))
        .catch(console.error)
    },

    /* connect wallet */
    async connect ({ state, commit, dispatch }) {
      try {
        // connect and update provider, signer
        walletProvider = await web3Modal.connect()
        provider = new Ethers.providers.Web3Provider(walletProvider)
        signer = provider.getSigner()

        // set user address
        const address = await signer.getAddress()
        commit('SIGN_IN', address)

        // set network id
        await dispatch('getNetworkId', provider)

        // commit('SET_CONTRACTS', provider)

        dispatch('listenToWalletProvider')
        return
      } catch (e) {
        console.error('@connect', e)
        // clear wallet in case
        dispatch('disconnect')
        // throw error so stops any flows (closes modal too)
        throw e
      }
    },

    /* disconnect wallet */
    disconnect ({ commit, dispatch }) {
      // clear so they can re-select from scratch
      web3Modal.clearCachedProvider()
      // manually clear walletconnect --- https://github.com/Web3Modal/web3modal/issues/354
      localStorage.removeItem('walletconnect')

      // if (walletProvider.off) {
      //   walletProvider.off('accountsChanged')
      //   walletProvider.off('disconnect')
      // }

      commit('SIGN_OUT')
      dispatch('setupFallbackProvider')
      signer = null
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

    getProvider () {
      return provider
    },

    async createProject ({ state, dispatch }, { project }) {
      try {
        const tx = await newProject({ owner: state.address, ...project })
        console.log('new project tx:', tx)
        return tx
      } catch (e) {
        console.error('@createProject', e)
        throw e
      }
    },

    waitForProjectCreate (_, tx) {
      const contract = getRadicleRegistryContract()

      // listen for project created by owner and return prj address
      return new Promise((resolve) => {
        // listener
        const onNewProject = async (dripTokenTemplate, projectAddress, projectOwner) => {
          console.log('@NewProject', { dripTokenTemplate, projectAddress, projectOwner, tx })

          // if owner matches tx sender...
          if (projectOwner.toLowerCase() === tx.from.toLowerCase()) {
            // unlisten and return address
            contract.off('NewProject', onNewProject)
            return resolve(projectAddress.toLowerCase())
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

    async getProject (_, projectAddress) {
      // query chain fallback handler
      const queryChain = async () => {
        try {
          console.log('Project not found in API (just created?). Querying chain...', projectAddress)
          const contract = getProjectContract(projectAddress)
          const ipfsHash = await contract.contractURI()
          return { ipfsHash }
        } catch (e) {
          console.error(e)
          // interpret any error as not found
          return null
        }
      }

      // go!
      try {
        // check api...
        const resp = await api({ query: queryProject, variables: { id: projectAddress } })

        if (resp.data?.fundingProject) {
          return resp.data.fundingProject
        }

        return queryChain()
      } catch (e) {
        console.error('@getProject', e)
        return queryChain()
      }
    },

    async getProjectMeta ({ dispatch }, { projectAddress, ipfsHash }) {
      try {
        if (!ipfsHash) {
          // fetch project...
          const resp = await api({ query: queryProjectMeta, variables: { id: projectAddress.toLowerCase() } })
          ipfsHash = resp.data?.fundingProject?.ipfsHash
        }

        if (!ipfsHash || ipfsHash.length !== 46) {
          if (ipfsHash) console.warn(`Empty or malformed ipfsHash for ${projectAddress}: ${ipfsHash}`)
          return null
        }

        // fetch meta from ipfs...
        const meta = await fetch(`${process.env.VUE_APP_IPFS_GATEWAY}/ipfs/${ipfsHash}`)
        return meta.json()
      } catch (e) {
        console.error('@getProjectMeta', e)
        throw e
      }
    },

    async approveDAIContract ({ state, dispatch }, address) {
      try {
        if (!state.address) await dispatch('connect')

        // if no address defined, set to DripsHub address
        address = address || DaiDripsHub.address

        const contract = new Ethers.Contract(DAI.address, DAI.abi, provider)
        const contractSigner = contract.connect(signer)
        // approve max amount
        const amount = Ethers.constants.MaxUint256
        const tx = await contractSigner.approve(address, amount)
        return tx
      } catch (e) {
        console.error('@approveDAIContract', e)
        // if (e.message) alert(e.message)
        throw e
      }
    },

    /* See how much DAI an address is allowed to spend on behalf of the signed-in user */
    async getAllowance ({ state, dispatch }, address) {
      if (!state.address) await dispatch('connect')
      // if no address defined, set to DripsHub address
      address = address || DaiDripsHub.address
      // get
      const daiContract = getDAIContract()
      return daiContract.allowance(state.address, address)
    },

    /* mint non-streaming / one-time payment nft */
    mintNFT ({ state }, { projectAddress, typeId, giveAmt }) {
      const contract = getProjectContract(projectAddress)
      const contractSigner = contract.connect(signer)
      return contractSigner['mint(address,uint128,uint128)'](state.address, typeId, giveAmt)
    },

    async mintStreamingNFT ({ state }, { projectAddress, typeId, topUpAmt, amtPerSec }) {
      const contract = getProjectContract(projectAddress)
      const contractSigner = contract.connect(signer)
      return contractSigner['mintStreaming(address,uint128,uint128,uint128)'](state.address, typeId, topUpAmt.toString(), amtPerSec.toString())
    },

    // async getFundingTotal (_, { projectAddress, isStreaming }) {
    //   try {
    //     const contract = getProjectContract(projectAddress)
    //     const event = isStreaming ? ['NewStreamingToken', 4] : ['NewToken', 3]

    //     // get events...
    //     const events = await contract.queryFilter(event[0])

    //     // add it up
    //     let totalWei = events.reduce((acc, curr) => acc.add(curr.args[event[1]]), bn.from(0))

    //     if (isStreaming) {
    //       // convert to monthly streaming rate
    //       totalWei = totalWei.mul(oneMonth)
    //     }

    //     return totalWei
    //   } catch (e) {
    //     console.error(e)
    //     throw e
    //   }
    // },

    // async waitForMint ({ state }, { projectAddress, isStreaming, typeId }) {
    //   const contract = getProjectContract(projectAddress)
    //   const eventName = isStreaming ? 'NewStreamingToken' : 'NewToken'

    //   return new Promise((resolve) => {
    //     // listener
    //     const onNewNFT = async (newTokenId, receiver, newTypeId) => {
    //       const nft = {
    //         tokenId: newTokenId.toString(),
    //         receiver,
    //         projectAddress,
    //         typeId: newTypeId.toString(),
    //       }
    //       console.log('@NewNFT', nft)

    //       // if owner matches tx sender...
    //       if (
    //         receiver.toLowerCase() === state.address.toLowerCase()
    //         // && typeId === newTypeId
    //       ) {
    //         contract.off(eventName, onNewNFT)
    //         return resolve(nft)
    //       }
    //     }

    //     // listen!
    //     console.log('listen for new NFT...')
    //     contract.on(eventName, onNewNFT)
    //   })
    // },

    async getNFTType (_, { projectAddress, nftTypeId = 0 }) {
      try {
        const contract = getProjectContract(projectAddress)
        return await contract.nftTypes(nftTypeId)
      } catch (e) {
        console.error('@getNFTType', e)
        throw e
      }
    },

    async getNFTBalance (_, { projectAddress, tokenId }) {
      try {
        if (!provider) await dispatch('init')
        const contract = getProjectContract(projectAddress)
        return contract['withdrawable(uint256)'](tokenId)
      } catch (e) {
        console.error('@getNFTBalance', e, arguments)
      }
    },

    async nftTopUp ({ state, dispatch }, { projectAddress, tokenId, amountWei }) {
      try {
        if (!signer) await dispatch('connect')

        // determine allowance
        const daiContract = getDAIContract()
        const allowance = await daiContract.allowance(state.address, projectAddress)

        if (allowance.lt(amountWei)) {
          alert("Your top-up amount is greater than what you've allowed the project to spend.")
          throw new Error('topup amount < allowance')
        }

        const contract = getProjectContract(projectAddress)
        const contractSigner = contract.connect(signer)
        // console.log('top up', projectAddress, tokenId, amountWei)
        // go
        const tx = await contractSigner['topUp(uint256,uint128)'](tokenId, amountWei)
        return tx
      } catch (e) {
        console.error('@nftTopUp', e)
        throw e
      }
    },

    async nftWithdraw (_, { projectAddress, tokenId, amountWei }) {
      try {
        // determine amount withdrawable
        const contract = getProjectContract(projectAddress)
        const withdrawable = await contract.withdrawable(tokenId)

        if (withdrawable.lt(amountWei)) {
          alert(`You can only withdraw ${Ethers.utils.formatEther(withdrawable)}.`)
          throw new Error('withdraw amount > withdrawable')
        }

        if (!signer) await dispatch('connect')
        const contractSigner = contract.connect(signer)
        // go!
        const tx = await contractSigner.withdraw(tokenId, amountWei)
        return tx
      } catch (e) {
        console.error('@nftTopUp', e)
        throw e
      }
    },

    async getNFTMetadata (_, { projectAddress, tokenId }) {
      try {
        const contract = getProjectContract(projectAddress)
        const hash = await contract.tokenURI(tokenId)
        const meta = await fetch(hash)
        return await meta.json()
      } catch (e) {
        console.error('@getNFTMetadata', e)
      }
    },

    async addDripToProject ({ dispatch }, { projectAddress, dripFraction, receiverWeights }) {
      if (!signer) await dispatch('connect')
      const contract = getProjectContract(projectAddress)
      const contractSigner = contract.connect(signer)
      return contractSigner.drip(dripFraction, receiverWeights) // tx
    },

    async getDripsBySender (_, address) {
      const emptyConfig = {
        balance: '0',
        timestamp: '0',
        receivers: [],
        withdrawable: () => '0'
      }
      try {
        // fetch...
        const resp = await api({ query: queryDripsConfigByID, variables: { id: address } })
        const config = resp.data?.dripsConfigs[0]
        if (config) {
          config.withdrawable = () => getDripsWithdrawable(config)
        }
        return config || emptyConfig
      } catch (e) {
        console.error(e)
        throw e
      }
    },

    async getDripsByReceiver ({ state }, receiver) {
      try {
        const resp = await api({ query: queryDripsByReceiver, variables: { receiver, first: 100 } })
        return resp.data?.dripsEntries || []
      } catch (e) {
        console.error(e)
        throw e
      }
    },

    // async getDripsReceivers ({ state, dispatch }, address) {
    //   try {
    //     if (!provider) await dispatch('init')

    //     const lastUpdate = {
    //       receivers: [],
    //       timestamp: 0,
    //       balance: 0,
    //       withdrawable: () => '0'
    //     }

    //     const contract = getHubContract()
    //     // fetch events...
    //     let events = await contract.queryFilter('DripsUpdated(address,uint128,(address,uint128)[])')

    //     if (!address) {
    //       return events
    //     }

    //     // filter by the address
    //     events = events.filter(event => event.args[0].toLowerCase() === address.toLowerCase())

    //     if (events.length) {
    //       const lastEvent = events.pop()
    //       lastUpdate.timestamp = (await lastEvent.getBlock()).timestamp
    //       lastUpdate.balance = lastEvent.args[1]
    //       lastUpdate.receivers = lastEvent.args[2]
    //       lastUpdate.withdrawable = () => getDripsWithdrawable(lastEvent)
    //     }

    //     return lastUpdate
    //   } catch (e) {
    //     console.error(e)
    //     throw e
    //   }
    // },

    async updateUserDrips ({ dispatch }, { lastUpdate, lastBalance, currentReceivers, balanceDelta, newReceivers }) {
      try {
        if (!signer) await dispatch('connect')

        const contract = getHubContract()
        const contractSigner = contract.connect(signer)
        // tx...
        return contractSigner['setDrips(uint64,uint128,(address,uint128)[],int128,(address,uint128)[])'](lastUpdate, lastBalance, currentReceivers, balanceDelta, newReceivers)
      } catch (e) {
        console.error(e)
        throw e
      }
    },

    async getSplitsBySender ({ state }, sender) {
      try {
        const resp = await api({ query: querySplitsBySender, variables: { sender, first: 100 } })
        let entries = resp.data?.splitsEntries || []
        // format
        entries = entries.map(entry => ({
          ...entry,
          percent: entry.weight / state.splitsFractionMax * 100
        }))
        return entries
      } catch (e) {
        console.error(e)
        throw e
      }
    },

    async getSplitsByReceiver ({ state }, receiver) {
      try {
        const resp = await api({ query: querySplitsByReceiver, variables: { receiver, first: 100 } })
        let entries = resp.data?.splitsEntries || []
        // format
        entries = entries.map(entry => ({
          ...entry,
          percent: entry.weight / state.splitsFractionMax * 100
        }))
        return entries
      } catch (e) {
        console.error(e)
        throw e
      }
    },

    // async getSplitsReceivers ({ state, dispatch }, address) {
    //   try {
    //     if (!provider) await dispatch('init')

    //     let splits = []
    //     let raw = []

    //     const contract = getHubContract()
    //     // fetch events...
    //     let events = await contract.queryFilter('SplitsUpdated')

    //     if (!address) {
    //       return events
    //     }

    //     // filter by the address?
    //     events = events.filter(event => event.args[0].toLowerCase() === address.toLowerCase())

    //     // has splits?
    //     if (events?.length) {
    //       const currentReceivers = events.pop().args[1]
    //       raw = currentReceivers

    //       // reformat...
    //       splits = currentReceivers.map(item => {
    //         const address = item[0].toLowerCase()
    //         const weight = item[1] // .toNumber()
    //         let percent = weight / state.splitsFractionMax * 100
    //         percent = Number(percent.toFixed(3))
    //         return {
    //           address,
    //           percent
    //         }
    //       })

    //       // sort by percent descending
    //       splits = splits.sort((a, b) => a.percent > b.percent ? -1 : a.percent < b.percent ? 1 : 0)
    //     }

    //     return { percents: splits, weights: raw }
    //   } catch (e) {
    //     console.error(e)
    //     return { percents: [], weights: [] }
    //   }
    // },

    async updateAddressSplits (_, { currentReceivers, newReceivers, projectAddress }) {
      try {
        // validate...
        newReceivers = await validateSplits(newReceivers, provider)

        let contract, method

        if (projectAddress) {
          contract = getProjectContract(projectAddress)
          method = 'changeSplitsReceivers'
        } else {
          contract = getHubContract()
          method = 'setSplits'
        }
        const contractSigner = contract.connect(signer)
        // submit
        return contractSigner[method](currentReceivers, newReceivers)
      } catch (e) {
        console.error(e)
        throw e
      }
    },

    getProjectDripFraction (_, projectAddress) {
      const contract = getHubContract()
      return contract.getDripsFraction(projectAddress)
    },

    getNFTActiveUntil (_, { projectAddress, tokenId }) {
      const contract = getProjectContract(projectAddress)
      return contract.activeUntil(tokenId)
    },

    getNFTWithdrawable (_, { projectAddress, tokenId }) {
      const contract = getProjectContract(projectAddress)
      return contract.withdrawable(tokenId)
    },

    async resolveAddress ({ state, getters, commit, dispatch }, { address }) {
      try {
        if (!state.networkId) {
          await dispatch('init')
        }

        // ENS enabled?
        if (networks[state.networkId].layer !== 'ethereum') {
          return null
        }

        // sanitize
        address = (address || '').toLowerCase()
        // saved?
        const saved = state.addresses[address]
        if (saved && saved.ens !== undefined) {
          return saved
        }
        // fetch new...
        if (!provider) await dispatch('init')
        const ens = await provider.lookupAddress(address)
        // save even if null so we don't have to lookup again
        commit('SAVE_ADDRESS', { address, ens })

        if (ens) {
          // get records async...
          const resolver = await provider.getResolver(ens)
          const records = ['avatar', 'url', 'com.twitter', 'vnd.twitter', 'com.github', 'vnd.github', 'com.discord', 'vnd.discord']
          // records...
          records.forEach(name => {
            resolver.getText(name)
              .then(value => commit('SAVE_ADDRESS_RECORD', { address, record: { name, value } }))
              // .catch(e => console.error(`Error getting ENS text record (${name} from ${ens}): ` + e ))
          })
        }

        return { ens }
      } catch (e) {
        console.error(e)
        return null
      }
    },

    async resolveENS ({ state, commit, dispatch }, ens) {
      try {
        // saved ?
        let address = Object.keys(state.addresses).find(key => ens && state.addresses[key].ens === ens)
        if (address) return address
        // resolve...
        if (!provider) await dispatch('init')
        address = await provider.resolveName(ens)
        if (address) {
          // save if resolved...
          commit('SAVE_ADDRESS', { address, ens })
        }
        return address
      } catch (e) {
        console.error(e)
        return null
      }
    },

    updateProjectMeta (_, { address, ipfsHash }) {
      const contract = getProjectContract(address)
      const contractSigner = contract.connect(signer)
      return contractSigner.changeContractURI(ipfsHash)
    },

    async getCollectable ({ dispatch }, { projectAddress, address }) {
      try {
        if (!provider) await dispatch('init')
        // get splits...
        const entries = await dispatch('getSplitsBySender', projectAddress || address)
        // format for method
        const currSplits = entries.map(entry => ([entry.receiver, entry.weight]))

        const contract = projectAddress ? getProjectContract(projectAddress) : getHubContract()
        // get...
        return projectAddress ? contract.collectable(currSplits) // from project
          : contract.collectable(address, currSplits) // from hub
      } catch (e) {
        console.error('@getCollectable', e)
        throw e
      }
    },

    async collectFunds ({ dispatch }, { projectAddress, address }) {
      try {
        // get + format splits
        let currSplits = await dispatch('getSplitsBySender', projectAddress || address)
        currSplits = currSplits.map(entry => ([entry.receiver, entry.weight]))

        // from project or hubs contract?
        const contract = projectAddress ? getProjectContract(projectAddress) : getHubContract()
        const contractSigner = contract.connect(signer)

        // sign...
        let tx
        if (projectAddress) {
          tx = await contractSigner.collect(currSplits)
        } else {
          tx = await contractSigner.collect(address, currSplits)
        }
        console.log('collect tx:', tx)
        return tx
      } catch (e) {
        console.error('@collectFunds', e)
        throw e
      }
    },

    async getENSResolver ({ dispatch }, ensName) {
      try {
        if (!provider) await dispatch('init')
        return provider.getResolver(ensName)
      } catch (e) {
        console.error(e)
      }
    }
  }
})

// helpers

function getRadicleRegistryContract () {
  return new Ethers.Contract(RadicleRegistry.address, RadicleRegistry.abi, provider)
}

function getProjectContract (address) {
  return new Ethers.Contract(address, DripsToken.abi, provider)
}

function getDAIContract () {
  return new Ethers.Contract(DAI.address, DAI.abi, provider)
}

function getHubContract () {
  return new Ethers.Contract(DaiDripsHub.address, DaiDripsHub.abi, provider)
}

function newProject ({ name, symbol, owner, ipfsHash, inputNFTTypes, drips }) {
  let contract = getRadicleRegistryContract()
  contract = contract.connect(signer)
  console.log('new project...', arguments)
  return contract.newProject(name, symbol, owner, ipfsHash, inputNFTTypes, drips)
}

export async function pinJSONToIPFS (json) {
  let resp = await fetch('/.netlify/functions/pin', {
    method: 'POST',
    body: JSON.stringify(json)
  })
  resp = await resp.json()
  return resp.IpfsHash
}

export function pinImageToIPFS (imgString) {
  return fetch('/.netlify/functions/pinImage', {
    method: 'POST',
    body: JSON.stringify(imgString)
  })
}
