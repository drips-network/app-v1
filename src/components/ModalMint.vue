<script setup>
import { ref, reactive, computed, inject, toRaw } from 'vue'
import store from '@/store'
import { BigNumber as bn, constants } from 'ethers'
import { fromWei, toDAI, toWei, toWeiPerSec } from '@/utils'
import Modal from '@/components/Modal'
import TxLink from '@/components/TxLink'
import { DialogTitle, DialogDescription } from '@headlessui/vue'
import Panel from '@/components/Panel'
import SvgDai from '@/components/SvgDai'
import InputBody from '@/components/InputBody'

const props = defineProps({
  projectAddress: String,
  tokenType: Object
})
const emit = defineEmits(['close'])
const meta = inject('projectMeta')

// token attributes
const isStreaming = toRaw(props.tokenType.streaming)
const typeId = toRaw(props.tokenType.tokenTypeId)
const minAmt = toRaw(props.tokenType.minAmt)
let minDAI = isStreaming ? toDAI(bn.from(minAmt).mul(30 * 24 * 60 * 60)) // bn
  : toDAI(minAmt)
// rounding
minDAI = Number(minDAI) % parseInt(minDAI) === 0 ? parseInt(minDAI) : Number(minDAI).toFixed(2)

// subscription
const rate = ref(minDAI)
const prePayMonths = ref(1)
const payTotalDAI = computed(() => rate.value * prePayMonths.value)

// one time
const amountDAI = ref(minDAI)

//
const state = reactive({
  approved: true, // check allowance on mint...
  nft: null,
  approveTx: null,
  mintTx: null
})

const mint = async () => {
  try {
    if (!store.state.address) await store.dispatch('connect')

    // check allowance
    const allowance = await store.dispatch('getAllowance', props.projectAddress)
    // !! not allowed
    if (allowance.lt(props.tokenType.minAmt)) {
      state.approved = false
      return
    }

    if (isStreaming) {
      // convert to wei
      const topUpAmt = toWei(payTotalDAI.value)
      const amtPerSec = toWeiPerSec(rate.value)

      // mint streaming...
      state.mintTx = await store.dispatch('mintStreamingNFT', {
        projectAddress: props.projectAddress,
        typeId,
        topUpAmt,
        amtPerSec
      })
    } else {
      // mint one-time...
      state.mintTx = await store.dispatch('mintNFT', {
        projectAddress: props.projectAddress,
        typeId,
        giveAmt: toWei(amountDAI.value)
      })
    }
    console.log('mint tx', state.mintTx)

    await state.mintTx.wait()

    state.nft = true
  } catch (e) {
    console.error(e)
    alert('Error minting: ' + (e.message || e))
  }
}

const approve = async () => {
  try {
    // send...
    state.approveTx = await store.dispatch('approveDAIContract', props.projectAddress)
    console.log('approve tx', state.approveTx)
    debugger

    // wait for confirmation...
    await state.approveTx.wait() // receipt

    state.approved = true
  } catch (e) {
    console.error(e)
    state.approved = false
  }
}
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="$emit('close')")

  panel.z-10.m-auto(icon="💧")

    template(v-slot:header)
      dialog-title
        | Join
        br
        | {{ meta.name }}

    template(v-slot:description)
      dialog-description.text-base.mx-auto.leading-relaxed.text-violet-650
        .mx-auto.px-24(v-if="isStreaming", style="max-width:28em")
          | Drip funds <b>every month</b> and receive a unique <b>Membership NFT</b> 🧩. #[b Top-up periodically] to ensure your membership doesn't become inactive. You can #[b withdraw] excess funds at any time.
        .mx-auto(v-else, style="max-width:24em")
          | Join this community by purchasing a unique<br><b>NFT Membership</b> 🧩 with a one-time payment.
        //- | Tokens will appear in your wallet, OpenSea and can be used to vote on proposals.

    form(@submit.prevent, validate)
      //- (subscription fields)
      template(v-if="isStreaming")
        //- input rate
        input-body.my-10(label="DAI per month*", :isFilled="typeof rate === 'number'", symbol="daipermo")
          input(v-model="rate", type="number", :placeholder="`min ${minDAI}`", :min="minDAI", step="0.01", required)

        //- input months prepay
        input-body.my-10(label="Months*", :isFilled="typeof prePayMonths === 'number'", symbol="months")
          input(v-model="prePayMonths", type="number", placeholder="6", min="1", step="1", required)

        //- total due
        .rounded-full.px-28.h-80.bg-indigo-700.flex.justify-between.items-center.font-semibold
          .text-lg.tracking-wide PAY
          .text-2xl.flex.items-center
            | {{ payTotalDAI }}
            svg-dai.h-28.ml-16

      //- (one-time fields)
      template(v-else)
        input-body(:label="`Amount (min. ${minDAI} DAI)`", symbol="dai")
          input(v-model="amountDAI", type="number", :placeholder="minDAI", :min="minDAI", step="0.01", required)

      //- (not approved message)
      template(v-if="!state.approved")
        .mt-40.text-center.text-orange-600.text-base.mx-auto.leading-normal.border.border-current.p-20.rounded-lg(style="width:calc(100% - 8rem);")
          p Before you can join, you must first #[b allow] the community to #[b withdraw your DAI]{{ isStreaming ? ' periodically to continue your membership' : '' }}.
          .mt-20.flex.justify-center
            button.btn.btn-sm.btn-outline-orange.px-32.border-orange-600.notouch_hover_text-indigo-900(@click.prevent="approve")
              template(v-if="state.approveTx") Allowing...
              template(v-else) Allow

          tx-link(v-if="state.approveTx && !state.approved", :tx="state.approveTx", clss="text-orange-600 text-sm")

      //- (btns)
      .mt-40.flex.justify-center.mb-6
        button.btn.btn-lg.btn-outline.mr-6.px-48(@click="$emit('close')")
          | {{ state.nft ? 'Close' : 'Cancel' }}

        //- (drip btn)
        template(v-if="!state.nft")
          button.btn.btn-lg.btn-violet.px-48(@click="mint", :disabled="!state.approved", :class="{'opacity-40': !state.approved}")
            template(v-if="state.mintTx") Joining...
            template(v-else)
              | Join 💧

        //- (view btn)
        template(v-else)
          router-link.btn.btn-lg.btn-violet.px-48(:to="{name: 'user-communities-joined', params: {address: $store.state.address}}")
            | View Token

      tx-link(v-if="state.mintTx && !state.nft", :tx="state.mintTx")

</template>
