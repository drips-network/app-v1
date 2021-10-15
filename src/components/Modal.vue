<script setup>
import { ref, reactive, computed } from 'vue'
import {
  Dialog,
  DialogOverlay,
  DialogTitle,
  DialogDescription
} from '@headlessui/vue'
import Panel from '@/components/Panel'
import InputBody from '@/components/InputBody'
import store from '@/store'
import { BigNumber as bn, constants } from 'ethers'
import { fromWei } from '@/utils'

const props = defineProps({
  isOpen: Boolean,
  projectAddress: String,
  nftType: Object
})

const minDAIPerSec = fromWei(props.nftType.minAmtPerSec) // bn
const minDAIPerMonth = minDAIPerSec.mul(30 * 24 * 60 * 60) // bn

const rate = ref(Math.max(1, minDAIPerMonth.toNumber())) // min at least 1...
const prePayMonths = ref(1)
const payTotalDAI = computed(() => rate.value * prePayMonths.value)

const state = reactive({
  // rate: 2, // DAI
  // prePayMonths: 1,
  // topUp: 5184000,
  approved: false,
  nft: null,
  approveTx: null,
  mintTx: null
})

// set mins

const topUpWei = computed(() => {
  return constants.WeiPerEther.mul(payTotalDAI.value)
})
const weiPerSec = computed(() => {
  return constants.WeiPerEther.mul(rate.value).div(30 * 24 * 60 * 60)
})

const emit = defineEmits(['close'])
const close = () => emit('close')

const approve = async () => {
  try {
    // send...
    state.approveTx = await store.dispatch('approveDAIContract', {
      projectAddress: props.projectAddress,
      amount: topUpWei.value
    })
    console.log('approve tx', state.approveTx)

    // wait for confirmation...
    await state.approveTx.wait() // receipt

    state.approved = topUpWei.value.toString()
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
      topUpAmt: topUpWei.value,
      amtPerSec: weiPerSec.value
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
        <input-body class="my-10" label="Monthly Rate (DAI)" :isFilled="typeof rate === 'number'">
          <input v-model="rate" type="number" placeholder="Monthly Rate (DAI)" :min="props.nftType.minAmtPerSec.toString()" step="1" required>
        </input-body>

        <input-body class="my-10" label="Pre-pay (Months)" :isFilled="typeof prePayMonths === 'number'">
          <input v-model="prePayMonths" type="number" placeholder="Pre-pay (Months)" min="1" step="1" required>
        </input-body>

        <!-- total due -->
        <div class="rounded-full px-24 h-80 bg-indigo-700 flex justify-between items-center font-semibold">
          <div class="text-lg">TOTAL</div>
          <div class="text-2xl"> {{ payTotalDAI }} DAI</div>
        </div>

        <!-- <p> {{ topUpWei.value.toString() }} WEI</p> -->

        <!-- <input-body class="my-10 mb-36" label="Pay 30 days (DAI-WEI)" :isFilled="typeof topUp === 'number'">
          <input class="opacity-50" v-model="topUp" type="number" placeholder="Pay 30 days (DAI-WEI)" disabled required>
        </input-body> -->

        <div class="flex justify-center mt-40">
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
