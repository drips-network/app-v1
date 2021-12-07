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

    if (isStreaming) {
      // check allowance
      const allowance = await store.dispatch('getAllowance', props.projectAddress)

      if (allowance.lt(props.tokenType.minAmt)) {
        alert('You must first approve this community\'s contract to be able to withdraw from your DAI balance periodically.')
        state.approved = false
        return
      }

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
        // TODO - remove temp + 1 wei once issue resolved:
        // https://github.com/radicle-dev/radicle-drips/issues/58
        giveAmt: toWei(amountDAI.value).eq(minAmt) ? toWei(amountDAI.value).add(1)
          : toWei(amountDAI.value)
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
modal(v-bind="$attrs", @close="$emit('close')")

  panel.z-10.m-auto(icon="💧")

    template(v-slot:header)
      dialog-title
        | Join
        br
        | #[span.text-violet-650 {{ meta.name }}]

    template(v-slot:description)
      dialog-description.text-base.mx-auto.leading-relaxed
        .mx-auto.px-24(v-if="isStreaming", style="max-widthff:25em")
          | Drip funds to this community every <b>month</b> and receive a unique NFT&nbsp;<b>Member Token</b> 🧩. Top-up your balance periodically to make sure your membership doesn't become inactive!
        .mx-auto(v-else, style="max-width:25em")
          | Join this community by purchasing a unique NFT&nbsp;<b>Member Token</b> 🧩 with a one-time payment.
        //- | Tokens will appear in your wallet, OpenSea and can be used to vote on proposals.

    form(@submit.prevent, validate)
      //- (subscription fields)
      template(v-if="isStreaming")
        //- input rate
        input-body.my-10(label="DAI Rate*", :isFilled="typeof rate === 'number'", symbol="daipermo")
          input(v-model="rate", type="number", :placeholder="`min ${minDAI}`", :min="minDAI", step="0.01", required)

        //- input months prepay
        input-body.my-10(label="Pre-pay*", :isFilled="typeof prePayMonths === 'number'", symbol="months")
          input(v-model="prePayMonths", type="number", placeholder="6", min="1", step="1", required)

        //- total due
        .rounded-full.px-28.h-80.bg-indigo-700.flex.justify-between.items-center.font-semibold
          .text-lg.tracking-wide PAY
          .text-2xl.flex.items-center
            | {{ payTotalDAI }}
            svg-dai.h-28.ml-16

      template(v-else)
        //- (one-time fields)
        input-body(:label="`Amount (min. ${minDAI} DAI)`", symbol="dai")
          input(v-model="amountDAI", type="number", :placeholder="minDAI", :min="minDAI", step="0.01", required)

      //- (approve btn)
      .mt-40.flex.justify-center.mb-6
        button.btn.btn-lg.btn-outline.mr-6.px-48(@click="$emit('close')")
          | {{ state.nft ? 'Close' : 'Cancel' }}

        template(v-if="!state.approved")
          button.btn.btn-lg.btn-violet.px-48(@click.prevent="approve")
            template(v-if="state.approveTx") Approving...
            template(v-else) Approve

        //- (drip btn)
        template(v-else-if="!state.nft")
          button.btn.btn-lg.btn-violet.px-48(@click="mint", :disabled="!state.approved", :class="{'opacity-25': !state.approved}")
            template(v-if="state.mintTx") Submitting...
            template(v-else)
              | Drip 💧

        //- (view btn)
        template(v-else)
          router-link.btn.btn-lg.btn-violet.px-48(:to="{name: 'user-communities-joined', params: {address: $store.state.address}}")
            | View

      tx-link(v-if="state.mintTx && !state.nft", :tx="state.mintTx")

</template>
