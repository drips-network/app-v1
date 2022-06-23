<script setup>
import { ref, reactive, computed, toRaw } from 'vue'
import store from '@/store'
import { BigNumber as bn, constants } from 'ethers'
import { ipfsUrl, fromWei, toDAI, toWei, toWeiPerSec, round } from '@/utils'
import Modal from '@/components/Modal.vue'
import TxLink from '@/components/TxLink.vue'
import { DialogTitle, DialogDescription } from '@headlessui/vue'
import Panel from '@/components/Panel.vue'
import SvgDai from '@/components/SvgDai.vue'
import InputBody from '@/components/InputBody.vue'
import FormMessage from '@/components/FormMessage.vue'

const props = defineProps({
  project: Object,
  meta: Object,
})
const emit = defineEmits(['close', 'minted'])

// token attributes
const tokenType = toRaw(props.project.tokenTypes[0])
const isStreaming = toRaw(tokenType.streaming)
const typeId = toRaw(tokenType.tokenTypeId)
const minAmt = toRaw(tokenType.minAmt)
const ipfsHash = tokenType.ipfsHash || import.meta.env.VITE_APP_NFT_DEFAULT_IMAGE_HASH

// min
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
    state.approveTx = await store.dispatch('approveDAIContract', props.project.id)

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
    if (!store.state.address) {
      // make web3modal clickable (headlessui Dialog makes it inert)
      const connectModal = document.getElementById('WEB3_CONNECT_MODAL_ID')
      connectModal.removeAttribute('inert')
      connectModal.removeAttribute('aria-hidden')

      await store.dispatch('connect')
    }

    // check allowance
    const allowance = await store.dispatch('getAllowance', props.project.id)
    // !! not allowed
    if (allowance.lt(tokenType.minAmt)) {
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
        projectAddress: props.project.id,
        typeId,
        topUpAmt,
        amtPerSec
      })
    } else {
      // one-time payment:
      const giveAmt = toWei(amountDAI.value)

      // check balance...
      if (walletBalanceWei.value === undefined) {
        await getWalletBalance()
      }
      
      // !! insufficient funds
      if (walletBalanceWei.value.lt(giveAmt)) {
        throw new Error('Insufficient funds in your wallet!')
      }
      
      // mint...
      state.mintTx = await store.dispatch('mintNFT', {
        projectAddress: props.project.id,
        typeId,
        giveAmt,
      })
    }

    // wait for tx...
    state.mintTxMsg = { message: 'Waiting for transaction confirmation...' }
    await state.mintTx.wait()

    emit('minted')
    state.nft = true
    state.mintTxMsg = { status: 1, message: 'You joined! View your <b>NFT Membership</b>!' }
  } catch (e) {
    state.mintTxMsg = { status: -1, message: e.reason || e.message || e }
  }
}

// balance
const walletBalance = ref()
const walletBalanceWei = ref()
const getWalletBalance = async () => {
  if (!store.state.address) return
  try {
    const wei = await store.dispatch('getBalanceDAI', store.state.address)
    walletBalanceWei.value = wei
    // round down to nearest DAI hundredth for input[max]
    walletBalance.value = round(toDAI(wei, 'exact'), 2, true)
  } catch (e) {
    console.error(e)
  }
}

getWalletBalance()
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="$emit('close')")

  panel.z-10.m-auto(icon="💧")

    template(v-slot:header)
      dialog-title.focus_outline-none(tabindex="0")
        | Join
        br
        | "{{ meta.name }}"

    template(v-slot:description)
      dialog-description.text-base.mx-auto.leading-relaxed.text-violet-650
        .mx-auto.px-24(v-if="isStreaming", style="max-width:28em")
          | Drip funds <b>every month</b> and receive a unique <b>Member NFT</b> 🧩. #[b Top-up periodically] to ensure your membership doesn't become #[b inactive]. You can #[b withdraw] excess funds at any time.
        .mx-auto(v-else, style="max-width:24em")
          | Make a <b>one-time payment</b> to join and receive this <b>Member NFT 🧩</b> in your wallet.
        //- | Tokens will appear in your wallet, OpenSea and can be used to vote on proposals.

    //- (loaded)
    template(v-if="ipfsHash")
      //- (image)
      figure.bg-indigo-950.rounded-xl.relative.mb-48.flex.p-56.relative
        //- label
        .absolute.top-0.left-0.w-full.text-center.text-sm.pt-4.font-normal.text-violet-600.opacity-90
          | Member NFT
        //- wrapper
        .w-full.relative
          .aspect-w-8.aspect-h-7
            img.mint-modal__nft-image.absolute.overlay.object-contain.object-center.transform.notouch_hover_scale-102.transition.duration-500(:src="ipfsUrl(ipfsHash)", alt="NFT Membership Image")

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
          .relative
            input-body(:label="`Membership Amount (min ${minDAI} DAI)`", symbol="dai")
              input(v-model="amountDAI", type="number", :placeholder="minDAI", :min="minDAI", required)
            //- (out of bounds!)
            .absolute.bottom-0.left-0.w-full.text-center.text-sm.pb-4(v-if="walletBalance !== undefined")
              button.text-violet-650(@click.stop.prevent="amountDAI = walletBalance")
                | Balance ~ {{ walletBalance.toFixed(2) }} DAI

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
