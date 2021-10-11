<script setup>
import { reactive } from 'vue'
import {
  Dialog,
  DialogOverlay,
  DialogTitle,
  DialogDescription
} from '@headlessui/vue'
import Panel from '@/components/Panel'
import InputBody from '@/components/InputBody'
import store from '@/store'

const props = defineProps({
  isOpen: Boolean,
  projectAddress: String
})

const state = reactive({
  rate: 1,
  topUp: 5184000,
  approved: false,
  nft: null
})

const emit = defineEmits(['close'])
const close = () => emit('close')

const approve = async () => {
  try {
    const tx = await store.dispatch('approveDAIContract', { projectAddress: props.projectAddress, amount: state.topUp })
    console.log('approve tx', tx)
    console.log(await tx.wait()) // receipt

    state.approved = state.topUp.toString()
  } catch (e) {
    console.error(e)
    state.approved = false
  }
}

const mint = async () => {
  try {
    const tx = await store.dispatch('mintProjectNFT', { projectAddress: props.projectAddress, topUpAmt: state.topUp, amtPerSec: state.rate })
    console.log('mint tx', tx)
    // console.log(await tx.wait()) // receipt

    state.nft = await store.dispatch('waitForNFTMint', { projectAddress: props.projectAddress })
  } catch (e) {
    console.error(e)
  }
}
</script>

<template>
  <Dialog :open="isOpen" @close="close" class="fixed inset-0 z-10 overflow-y-auto flex py-60 px-30">
    <DialogOverlay class="fixed overlay bg-indigo-900 opacity-75" />

    <Panel icon="🌈" class="z-10 m-auto">
      <template v-slot:header>
        <DialogTitle>Fund</DialogTitle>
      </template>

      <template v-slot:description>
        <DialogDescription class="text-base mx-auto" style="max-width:23em">
          Fund this project and receive a unique NFT to show your support and vote on proposals.
        </DialogDescription>
      </template>

      <input-body class="my-10" label="Rate (DAI-WEI/sec)" :isFilled="typeof state.rate === 'number'">
        <input v-model="state.rate" type="number" placeholder="Rate (DAI-WEI/sec)" required>
      </input-body>
      <input-body class="my-10 mb-36" label="Pre-pay (DAI-WEI)" :isFilled="typeof state.topUp === 'number'">
        <input v-model="state.topUp" type="number" placeholder="Pre-pay (DAI-WEI)" required>
      </input-body>

      <template v-if="state.nft">
        <router-link :to="{name: 'user', params: {address: $store.state.address}, query: state.nft }" class="btn btn-lg btn-white mx-auto w-full" @click="approve">View NFT</router-link>
      </template>

      <template v-else-if="!state.approved">
        <button class="btn btn-lg btn-white mx-auto w-full" @click="approve">Approve...</button>
      </template>

      <template v-else>
        <button class="btn btn-lg btn-white mx-auto w-full" @click="mint">Subscribe</button>
      </template>
    </Panel>

  </Dialog>
</template>
