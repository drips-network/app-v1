<script setup>
import { reactive, computed } from 'vue'
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
  projectAddress: String,
  nftType: Object
})

const state = reactive({
  rate: 2,
  // topUp: 5184000,
  approved: false,
  nft: null,
  approveTx: null,
  mintTx: null
})

// set mins
state.rate = Number(props.nftType.minAmtPerSec.toString())
const topUp = computed(() => state.rate * 30 * 24 * 60 * 60) // 30 days / 1 term

const emit = defineEmits(['close'])
const close = () => emit('close')

const approve = async () => {
  try {
    // send...
    state.approveTx = await store.dispatch('approveDAIContract', {
      projectAddress: props.projectAddress,
      amount: topUp.value
    })
    console.log('approve tx', state.approveTx)

    // wait for confirmation...
    await state.approveTx.wait() // receipt

    state.approved = topUp.value.toString()
  } catch (e) {
    console.error(e)
    state.approved = false
  }
}

const mint = async () => {
  try {
    // mint...
    state.mintTx = await store.dispatch('mintProjectNFT', {
      projectAddress: props.projectAddress,
      topUpAmt: topUp.value,
      amtPerSec: state.rate
    })
    console.log('mint tx', state.mintTx)

    // console.log(await tx.wait()) // receipt

    // on confirmation...
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

      <form @submit.prevent validate>
        <input-body class="my-10" label="Rate (DAI-WEI/sec)" :isFilled="typeof state.rate === 'number'">
          <input v-model="state.rate" type="number" placeholder="Rate (DAI-WEI/sec)" :min="props.nftType.minAmtPerSec.toString()" step="1" required>
        </input-body>
        <input-body class="my-10 mb-36" label="Pay 30 days (DAI-WEI)" :isFilled="typeof topUp === 'number'">
          <input class="opacity-50" v-model="topUp" type="number" placeholder="Pay 30 days (DAI-WEI)" disabled required>
        </input-body>

        <div class="flex justify-center">
          <template v-if="state.nft">
            <router-link :to="{name: 'user-funds', params: {address: $store.state.address}}" class="btn btn-lg btn-white min-w-sm mx-auto">View NFT</router-link>
          </template>

          <template v-else-if="!state.approved">
            <button class="btn btn-lg btn-white min-w-sm mx-auto" @click="approve">
              <template v-if="state.approveTx">Approving...</template>
              <template v-else>Approve</template>
            </button>
          </template>

          <template v-else>
            <button class="btn btn-lg btn-white min-w-sm mx-auto" @click="mint">
              <template v-if="state.mintTx">Subscribing...</template>
              <template v-else>Subscribe</template>
            </button>
          </template>
        </div>
      </form>

    </Panel>

  </Dialog>
</template>
