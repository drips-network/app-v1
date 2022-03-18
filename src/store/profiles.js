import { ethers as Ethers } from 'ethers'
import { Metadata } from '../../contracts'
import bs58 from 'bs58'

export default {
  namespaced: true,
  state () {
    return {
      profiles: {}
    }
  },
  getters: {
    name: state => (address = '') => {
      const profile = state.profiles[address.toLowerCase()]
      return profile?.ens?.name || profile?.meta?.name
    },
    record: state => (address = '', key = '') => {
      const profile = state.profiles[address.toLowerCase()]
      const ensRecords = profile?.ens?.records || {}
      const metaRecords = profile?.meta || {}
      return ensRecords[key] || metaRecords [key] || ensRecords['vnd.' + key] || ensRecords['com.' + key] || metaRecords['vnd.' + key] || metaRecords['com.' + key]
    }
  },
  mutations: {
    SAVE_ADDRESS_ENS_NAME (state, { address, name }) {
      state.profiles[address.toLowerCase()] = { ens: { name, records: {} }}
    },
    SAVE_ADDRESS_ENS_RECORD (state, { address, record }) {
      // should already exist from ens name lookup
      state.profiles[address.toLowerCase()].ens.records[record.name] = record.value
    },
    SAVE_ADDRESS_METADATA (state, { address, meta }) {
      address = address.toLowerCase()
      const profile = state.profiles[address] || {}
      state.profiles[address] = { ...profile, meta }
    },
  },
  actions: {
    async getName ({ state, getters, commit, dispatch, rootGetters, rootState }, address) {
      try {
        // sanitize
        address = (address || '').toLowerCase()

        let name = getters.name(address)

        if (name) {
          return name
        }

        // ens?
        name = await dispatch('getENSName', address)

        // try metadata contract...
        if (!name && state.profiles[address]?.meta === undefined) {
          // fetch from meta contract, and will be available from getter if set
          await dispatch('getMetadataByAddress', { address })
        }

        name = getters.name(address)

        // is a project address? get name from project meta
        if (!name) {
          const projectMeta = await dispatch('getProjectMeta', { projectAddress: address }, { root:true })
          name = projectMeta?.name
        }

        return name
      } catch (e) {
        console.error(e)
        return null
      }
    },

    async getAvatar ({ getters, dispatch, commit }, { address = '' }) {
      try {
        let value = getters.record(address, 'avatar')

        if (value) {
          return value
        }
          
        // else fetch...
        address = address.toLowerCase()
        const ensName = await dispatch('getENSName', address)

        if (ensName) {
          const provider = await dispatch('getProvider', null, { root: true })
          const resolver = await provider.getResolver(ensName)
          value = resolver.getText('avatar')
          commit('SAVE_ADDRESS_ENS_RECORD', { address, record: { name: 'avatar', value }})
        }

        if (!value) {
          await dispatch('getMetadataByAddress', { address })  
        }

        return getters.record(address, 'avatar')
      } catch (e) {
        console.error(e)
      }
    },

    async getProfile ({ state, commit, dispatch }, { address = '', flush = false }) {
      try {
        address = address.toLowerCase()
        let profile = state.profiles[address]

        // if profile has been looked up, return profile
        // if (profile?.meta !== undefined && !flush) {
        //   return profile
        // }

        // else, lookup:

        // ENS:
        const ensName = await dispatch('getENSName', address)

        if (ensName) {
          // fetch records in the backround...
          // TODO - ens has sdk to get all records at once?
          const provider = await dispatch('getProvider', null, { root: true })
          const resolver = await provider.getResolver(ensName)
          const records = ['description', 'url', 'com.twitter', 'vnd.twitter', 'com.github', 'vnd.github', 'com.discord', 'vnd.discord']
          
          records.forEach(name => {
            resolver.getText(name)
              .then(value => commit('SAVE_ADDRESS_ENS_RECORD', { address, record: { name, value } }))
              // .catch(e => console.error(`Error getting ENS text record (${name} from ${ens}): ` + e ))
          })
        }

        // METADATA CONTRACT:
        await dispatch('getMetadataByAddress', { address })

        return state.profiles[address]
      } catch (e) {
        console.error(e)        
      }
    },

    async getENSName ({ state, dispatch, commit, rootState, rootGetters }, address) {
      try {
        // ensure network is known...
        if (!rootState.networkId) {
          await dispatch('init', null, {root: true})
        }

        let ensName = state.profiles[address]?.ens?.name

        if (ensName) {
          return ensName
        }

        // query if Ethereum network (AFTER INIT) and hasn't been looked up already
        if (ensName === undefined && rootGetters.isEthereum) {
          // fetch...
          const provider = await dispatch('getProvider', null, { root: true })
          ensName = (await provider.lookupAddress(address) || null)

          // save even if null so we don't have to lookup again
          commit('SAVE_ADDRESS_ENS_NAME', { address, name: ensName })
        }

        return ensName
      } catch (e) {
        console.error(e)
      }
    },

    async updateSignerMetadata ({ dispatch }, { ipfsHash }) {
      try {
        const provider = await dispatch('getProvider', null, { root: true })
        const contract = getMetadataContract(provider)

        const signer = await dispatch('getSigner', null, { root: true })
        const contractSigner = contract.connect(signer)
        // convert ipfs hash to bytes array for contract method (cheaper gas)
        const multihash = toMultiHash(ipfsHash)
        // tx
        return contractSigner.publish(multihash)
      } catch (e) {
        console.error(e)
      }
    },

    async getMetadataByAddress ({ state, commit, dispatch }, { address, flush = false }) {
      try {
        // use cached?
        // if (!flush) {
        //   const saved = state.addresses[address]?.meta
        //   if (saved) return saved
        // }

        const provider = await dispatch('getProvider', null, { root: true })
        const contract = getMetadataContract(provider)
        // get all events
        const allEvents = await contract.queryFilter('MultiHash')
        // get address's last update's multi-hash
        const myLastUpdateHex = allEvents.reverse().find(event => event.args.addr.toLowerCase() === address.toLowerCase())?.args[1]
        if (myLastUpdateHex) {
          // convert to ipfs hash
          const ipfsHash = hexToBase58(myLastUpdateHex)
          const resp = await fetch(`${process.env.VUE_APP_IPFS_GATEWAY}/ipfs/${ipfsHash}`)
          const meta = (await resp.json() || null)
          // save
          commit('SAVE_ADDRESS_METADATA', { address, meta })
          return meta
        }

        return null
      } catch (e) {
        console.error(e)
      }
    }
  }
}

// helpers
function getMetadataContract (provider) {
  return new Ethers.Contract(Metadata.address, Metadata.abi, provider)
}

function toMultiHash (hash) {
  return bs58.decode(hash) 
}

// for converting identity multihash to ipfshash
function hexToBase58 (hex) {
  const input = hex.substring(2)
  var array = []
  for (var i = 0; i < input.length; i=i+2) {
    array.push(parseInt(input.substring(i, i+2), 16))
  }
  return bs58.encode(array)
}