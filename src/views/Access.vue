<template lang="pug">
article.access-drips.pt-72.px-10.pb-120
  .w-full.mx-auto.max-w-6xl
    header.text-center
      h1.text-2xl.font-bold.text-violet-650 Accessing Drips

    section.mt-56.children-mt-em.text-lg.leading-normal.md_text-base.md_leading-normal
      p The Drips protocol is a collection of public, open smart contracts deployed on EVM-based blockchains, equally accessible to every user and application. Because of this, there is no one single way of interacting with the Drips protocol. While the Drips App is one way of interacting with the Drips protocol, users can also access the full power and functionality of Drips contracts in any of the following alternative ways as well:

      p The #[a.text-violet-650.font-bold(href="https://github.com/radicle-dev/drips-js-sdk", target="_blank", rel="noopener noreferrer") Drips SDK] is a Javascript SDK that allows any application or user-created code to interact directly with the Drips smart contracts and utilize the full feature set of the protocol in whatever way they wish. Drips contracts can be freely integrated into any website, dapp or application at any time using the SDK.

      p #[a.text-violet-650.font-bold(href="https://etherscan.io", target="_blank", rel="noopener noreferrer") Etherscan] is a block explorer and analytics platform for Ethereum. Other networks have similar block exploers, often also operated by Etherscan. The Drips contracts can be accessed using these block explorers at the addresses specified on the #[a.text-violet-650(href="https://docs.drips.network/docs/for-developers/smart-contract-and-subgraph-details", target="_blank", rel="noopener noreferrer") Smart Contract and Subgraph Details Page]. For example, the DripsHub smart contract on the Rinkeby testnet can be acessed #[a.text-violet-650(href="https://rinkeby.etherscan.io/address/0xfbcD6918907902c106A99058146CBdBb76a812f6", target="_blank", rel="noopener noreferrer") here].

      p #[a.text-violet-650.font-bold(href="https://eth.build/", target="_blank", rel="noopener noreferrer") ethBuild] is an educational sandbox for web3, including drag-and-drop programming and open source building blocks. With ethBuild, you can call a function on an Ethereum contract (for example, to create a Drip or Split configuration) by sending it a transaction with the function arguments in the data.

      p #[a.text-violet-650.font-bold(href="https://www.myetherwallet.com/", target="_blank", rel="noopener noreferrer") MyEtherWallet] is a free, client side interface helping you interact with the Ethereum blockchain. Their easy-to-use, open-source platform allows you to generate wallets, interact with (Drips) smart contracts, and more.

      p The #[a.text-violet-650.font-bold(href="https://web3js.readthedocs.io/en/v1.7.5/", target="_blank", rel="noopener noreferrer") web3.js Library] makes it easy to interact with smart contracts on the Ethereum blockchain, including the Drips smart contracts.

      p The #[a.text-violet-650.font-bold(href="https://docs.ethers.io/v5/", target="_blank", rel="noopener noreferrer") ethers.js Library] is another Javascript library for interacting directly with Ethereum smart contracts, including the Drips smart contracts.
</template>

<script setup>

</script>