<script setup>
import { ref, reactive, computed } from 'vue'
import store from '@/store'
import { BigNumber as bn, constants } from 'ethers'
import { fromWei } from '@/utils'
import Modal from '@/components/Modal'
import {
  DialogTitle,
  DialogDescription
} from '@headlessui/vue'
import Panel from '@/components/Panel'
import SvgDai from '@/components/SvgDai'
import InputBody from '@/components/InputBody'

const props = defineProps({
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
  approved: true, // check allowance on mint...
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

const mint = async () => {
  try {
    // check allowance
    const allowance = await store.dispatch('getProjectAllowance', props.projectAddress)

    if (allowance.lt(topUpWei.value)) {
      alert('You must first approve the contract to withdraw your DAI periodically.')
      state.approved = false
      throw new Error('Exceeds project allowance')
    }

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

const approve = async () => {
  try {
    // send...
    state.approveTx = await store.dispatch('approveDAIContract', props.projectAddress)
    console.log('approve tx', state.approveTx)

    // wait for confirmation...
    await state.approveTx.wait() // receipt

    state.approved = topUpWei.value.toString()
  } catch (e) {
    console.error(e)
    state.approved = false
  }
}
</script>

<template lang="pug">
modal(panelIcon="🌈", v-bind="$attrs", v-on="$listeners")

  panel.z-10.m-auto(icon="🌈")

    template(v-slot:header)
      dialog-title Fund

    template(v-slot:description)
      dialog-description.text-base.mx-auto(style="max-width:23em")
        | Fund this project and receive a unique NFT to show your support and vote on proposals.

    form(@submit.prevent, validate, :class="{'opacity-25 pointer-events-none': state.nft}")
      //- input rate
      input-body.my-10(label="Monthly Rate (DAI)", :isFilled="typeof rate === 'number'")
        input(v-model="rate", type="number", placeholder="Monthly Rate (DAI)", :min="minDAIPerMonth.toString()", step="1", required)

      //- input months prepay
      input-body.my-10(label="Pre-pay (Months)", :isFilled="typeof prePayMonths === 'number'")
        input(v-model="prePayMonths", type="number", placeholder="Pre-pay (Months)", min="1", step="1", required)

      //- total due
      .rounded-full.px-24.h-80.bg-indigo-700.flex.justify-between.items-center.font-semibold
        .text-lg TOTAL
        .text-2xl.flex
          | {{ payTotalDAI }}
          svg-dai.w-32.h-32.ml-16

      //- TODO - show as second button for better UX
      template(v-if="!state.approved")
        .mt-40.mb-12.flex.justify-center
          button.btn.btn-lg.btn-violet.min-w-sm.mx-auto(@click="approve")
            template(v-if="state.approveTx") Approving...
            template(v-else) 1. Approve

      //- (fund button)
      template(v-if="!state.nft")
        .mt-40.flex.justify-center
          button.btn.btn-lg.btn-violet.min-w-sm.mx-auto(@click="mint", :disabled="!state.approved", :class="{'opacity-25': !state.approved}")
            template(v-if="state.mintTx") Submitting...
            template(v-else)
              template(v-if="!state.approved") 2.
              | Fund

    //- (view nft btn)
    .mt-40.flex.justify-center
      //- (view nft link)
      template(v-if="state.nft")
        <router-link :to="{name: 'user-drips', params: {address: $store.state.address}}" class="btn btn-lg btn-violet min-w-sm mx-auto">View NFT</router-link>

</template>
