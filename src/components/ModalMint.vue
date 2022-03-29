<script setup>
import { ref, reactive, computed, inject, toRaw } from 'vue'
import store from '@/store'
import { BigNumber as bn, constants } from 'ethers'
import { ipfsUrl, fromWei, toDAI, toWei, toWeiPerSec } from '@/utils'
import Modal from '@/components/Modal.vue'
import TxLink from '@/components/TxLink.vue'
import { DialogTitle, DialogDescription } from '@headlessui/vue'
import Panel from '@/components/Panel.vue'
import SvgDai from '@/components/SvgDai.vue'
import InputBody from '@/components/InputBody.vue'
import FormMessage from '@/components/FormMessage.vue'

const props = defineProps({
  projectAddress: String,
  tokenType: Object
})
const emit = defineEmits(['close', 'minted'])

const meta = inject('projectMeta')

// token attributes
const isStreaming = toRaw(props.tokenType?.streaming)
const typeId = toRaw(props.tokenType.tokenTypeId)
const minAmt = toRaw(props.tokenType.minAmt)
let minDAI = isStreaming ? toDAI(bn.from(minAmt).mul(30 * 24 * 60 * 60), 'exact') // bn
  : toDAI(minAmt, 'exact')
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
  approveVisible: false,
  approveTx: null,
  approveTxMsg: null,
  mintTx: null,
  mintTxMsg: null
})

const approve = async () => {
  try {
    // reset
    state.approveTx = null
    state.approveTxMsg = null

    // send...
    state.approveTxMsg = { message: 'Confirm the transaction in your wallet.' }
    state.approveTx = await store.dispatch('approveDAIContract', props.projectAddress)

    // wait for confirmation...
    state.approveTxMsg = { message: 'Waiting for transaction confirmation...' }
    const receipt = await state.approveTx.wait() // receipt

    state.approved = true
    state.approveTxMsg = null
  } catch (e) {
    state.approveTxMsg = { status: -1, message: e.message || e }
  }
}

const mint = async () => {
  try {
    // reset
    state.mintTxMsg = null

    // connect wallet?
    if (!store.state.address) await store.dispatch('connect')

    // check allowance
    const allowance = await store.dispatch('getAllowance', props.projectAddress)
    // !! not allowed
    if (allowance.lt(props.tokenType.minAmt)) {
      state.approved = false
      state.approveVisible = true
      return
    }

    // begin tx
    state.mintTxMsg = { message: 'Confirm the transaction in your wallet.' }
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

    // wait for tx...
    state.mintTxMsg = { message: 'Waiting for transaction confirmation...' }
    await state.mintTx.wait()

    emit('minted')
    state.nft = true
    state.mintTxMsg = { status: 1, message: 'You joined! View your <b>NFT Membership</b>!' }
  } catch (e) {
    console.error(e)
    state.mintTxMsg = { status: -1, message: e.message || e }
  }
}
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="$emit('close')")

  panel.z-10.m-auto(icon="💧")

    template(v-slot:header)
      dialog-title(tabindex="0")
        | Join Community
        br
        | "{{ meta.name }}"

    template(v-slot:description)
      dialog-description.text-base.mx-auto.leading-relaxed.text-violet-650
        .mx-auto.px-24(v-if="isStreaming", style="max-width:28em")
          | Drip funds <b>every month</b> and receive a unique <b>Membership NFT</b> 🧩. #[b Top-up periodically] to ensure your membership doesn't become #[b inactive]. You can #[b withdraw] excess funds at any time.
        .mx-auto(v-else, style="max-width:24em")
          | Join this community by purchasing a unique<br><b>NFT Membership</b> 🧩 with a one-time payment.
        //- | Tokens will appear in your wallet, OpenSea and can be used to vote on proposals.

    //- (image)
    template(v-if="props.tokenType.ipfsHash")
      figure.bg-indigo-950.rounded-xl.relative.mb-48.flex.p-56.relative
        //- label
        .absolute.top-0.left-0.w-full.text-center.text-sm.pt-4.font-normal.text-violet-600.opacity-90
          | Membership NFT
        //- wrapper
        .w-full.relative
          .aspect-w-8.aspect-h-7
            img.mint-modal__nft-image.absolute.overlay.object-contain.object-center.transform.notouch_hover_scale-102.transition.duration-500(:src="ipfsUrl(props.tokenType.ipfsHash)", alt="NFT Membership Image")

    //- inputs
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
      template(v-if="state.approveVisible")
        //- fades when approved
        .rounded-2xlb.bg-indigo-950.p-24.mx-40.mt-40.text-violet-650.transition.duration-500.delay-1000(:class="{'pointer-events-none opacity-50': state.approved}")
          p.text-base.leading-normal Before you can join, you must first #[b allow] the community to #[b withdraw your DAI]{{ isStreaming ? ' periodically to continue your membership' : '' }}.

          //- (tx message)
          form-message.my-28(v-if="state.approveTxMsg", :body="state.approveTxMsg", :border="true")

          //- allow btn
          .mt-24.flex.justify-center.-mb-4
            button.btn.btn-md.btn-violet.px-32.text-md.font-semibold.tracking-wide(@click.prevent="approve", :disabled="state.approved")
              template(v-if="state.approved") Allowed!
              template(v-else-if="state.approveTx") Allowing...
              template(v-else) Allow

          //- (tx link)
          tx-link(v-if="state.approveTx && !state.approved", :tx="state.approveTx", clss="text-sm")

      //- (btns)
      .mt-48
        //- (tx message)
        form-message.my-40(v-if="state.mintTxMsg", :body="state.mintTxMsg")

        .flex.justify-center.mb-6
          //- close/cancel btn
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
              | View Membership

        tx-link(v-if="state.mintTx && !state.nft", :tx="state.mintTx")

</template>

<style lang="postcss">
.mint-modal__nft-image {
  /* animation:  levitate 3s infinite; */
}

@keyframes levitate {
  /* 0% {
    transform: translateY(-0.5rem);
  }
  50%{
    transform: translateY(0.5rem);
  }
  100%{
    transform: translateY(-0.5rem);
  } */
  0%, 100% {
      transform: translateY(-1%);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: translateY(0);
      /* animation-timing-function: cubic-bezier(0, 0, 0.2, 1); */
      animation-timing-function: cubic-bezier(0, 0, 1, 1);
    }
}
</style>
