const networks = ['e', 'p']

export default function label (name, network = 'ethereum') {
  const id = networks.includes(network[0]) ? network[0] : 'e'
  return labels[name] && labels[name][id] ? labels[name][id] : '[missing label]'
}

const labels = {
  inputAddressLabel: {
    e: "Recipient's Ethereum Address or ENS name",
    p: "Recipient's Wallet Address"
  },
  inputAddressPlaceholder: {
    e: 'name.eth',
    p: '0x...'
  }
}
