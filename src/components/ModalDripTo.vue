<script setup>
import { ref, computed } from 'vue'
import Modal from '@/components/Modal.vue'
import Panel from '@/components/Panel.vue'
import { DialogTitle, DialogDescription } from '@headlessui/vue'
import Addr from '@/components/Addr.vue'
import InputBody from '@/components/InputBody.vue'
import InputRadio from '@/components/InputRadio.vue'
import SvgDai from '@/components/SvgDai.vue'
import ModalSplitsEdit from '@/components/ModalSplitsEdit.vue'
import ModalDripsEdit from '@/components/ModalDripsEdit.vue'
import FormMessage from '@/components/FormMessage.vue'
import TxLink from '@/components/TxLink.vue'
import { constants } from 'ethers'
import { toWei } from '@/utils'
import store from '@/store'
import { useRouter } from 'vue-router'
const router = useRouter()

const props = defineProps(['address'])

const dripType = ref()
const dripAmt = ref(10)
const dripToReceiver = ref(props.address)

// const minDAIPerSec = constants.WeiPerEther // 1 DAI (bn)
const minDAIPerMonth = 1 // minDAIPerSec.mul(30 * 24 * 60 * 60) // bn

const rate = ref(minDAIPerMonth) // Math.max(1, minDAIPerMonth.toNumber())) // min at least 1...
const prePayMonths = ref(1)
const payTotalDAI = computed(() => rate.value * prePayMonths.value)

const topUpWei = computed(() => {
  return constants.WeiPerEther.mul(payTotalDAI.value)
})
const weiPerSec = computed(() => {
  return constants.WeiPerEther.mul(rate.value).div(30 * 24 * 60 * 60)
})

const confirmSplits = ref(false)
const confirmDrips = ref(false)

const confirm = () => {
  if (dripType.value === 'give') {
    return give()
  } else if (dripType.value === 'drip') {
    confirmDrips.value = true
  } else if (dripType.value === 'split') {
    confirmSplits.value = true
  }
}

// give() action
const tx = ref()
const txReceipt = ref()
const txMsg = ref()

const give = async () => {
  try {
    tx.value = null
    txReceipt.value = null
    txMsg.value = null

    const amt = toWei(dripAmt.value) // .toString()
    // check allowance...
    if (amt.gt(0)) {
      const allowance = await store.dispatch('getAllowance') // of dripsHub
      console.log({ allowance })
      // !! below allowance
      if (allowance.lt(amt)) {
        // alert('You must first approve the contract to be able to withdraw your DAI.')
        approved.value = false
        approveVisible.value = true
        return false
      }
    }
    // submit...
    txMsg.value = { message: 'Confirm the transaction in your wallet.' }
    tx.value = await store.dispatch('dripOnce', { address: dripToReceiver.value, amt })

    // wait for tx...
    txMsg.value = { message: 'Waiting for transaction confirmation...' }
    txReceipt.value = await tx.value.wait()

    // confirmed!
    txMsg.value = { status: 1, message: 'Confirmed! View your drip!' }
    tx.value = null

    emit('newDrip')
  } catch (e) {
    txMsg.value = { status: -1, message: e.reason || e.data?.message || e.message || e }
  }
}

// TODO - approve ui in it's own component...
const approved = ref(true) // assume true to start
const approveTx = ref()
const approveVisible = ref(false)
const approveTxMsg = ref()

const approve = async () => {
  try {
    approveTxMsg.value = null

    // send...
    approveTxMsg.value = { message: 'Confirm the transaction in your wallet.' }
    approveTx.value = await store.dispatch('approveDAIContract')
    console.log('approve tx...', approveTx.value)

    // wait for confirmation...
    approveTxMsg.value = { message: 'Waiting for transaction confirmation...' }
    await approveTx.value.wait() // receipt

    approved.value = true // topUpWei.value.toString()
    approveTx.value = null
    approveTxMsg.value = null
  } catch (e) {
    // console.error(e)
    approveTxMsg.value = { status: -1, message: e.reason || e.message || e }
  }
}

const viewMyDrip = () => {
  emit('updated')
  emit('close')
  router.push({ name: 'user-drips-in', params: { address: props.address } })
}

const emit = defineEmits(['close', 'newDrip'])
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="$emit('close')")

  panel.z-10.m-auto(icon="💧")

    template(v-slot:header)
      dialog-title.leading-snug
        | Drip to #[addr.text-violet-650ff(:address="props.address", @ens="ens => { dripToReceiver = ens }")]

    template(v-slot:description)
      dialog-description.text-violet-650
        template(v-if="dripType === 'split'") What #[b percent] of your drips would you like to split?
        template(v-else-if="dripType === 'drip'") How much would you like to drip #[b every month]?
        template(v-else-if="dripType") How much would you like to drip?
        template(v-else) How would you like to drip?

    //- (select type ui)
    div(v-if="!dripType")
      .mt-40.flex.justify-center.flex-wrap
        button.btn.btn-lg.btn-violet.mx-3.my-3.px-40(@click="dripType = 'give'") Drip Once 💧
        button.btn.btn-lg.btn-violet.mx-3.my-3.px-40(@click="dripType = 'drip'") Drip Monthly 🗓
        button.btn.btn-lg.btn-violet.mx-3.my-3.px-40(@click="dripType = 'split'") Split your Drips 💦

      .mt-40.flex.justify-center
        button.btn.btn-lg.btn-outline.px-40(@click="$emit('close')") Cancel

    //- (input ui)
    form(v-if="dripType", @submit.prevent="confirm", validate)
      //- (give input)
      template(v-if="dripType === 'give'")
        input-body(label="DAI amount", theme="outline", symbol="dai")
          input(type="number", v-model="dripAmt", min="0.01", step="0.01", v-autofocus)

      //- (monthly input)
      template(v-else-if="dripType === 'drip'")
        input-body(label="DAI per month", theme="outline", symbol="daipermo")
          input(type="number", v-model="dripAmt", min="0.01", step="0.01", v-autofocus)

      //- (split input)
      template(v-else-if="dripType === 'split'")
        input-body(label="Percent to split", theme="outline", symbol="percent")
          input(type="number", v-model="dripAmt", min="0.01", max="100", step="0.01", v-autofocus)

      //- (drip once "not approved" message)
      template(v-if="approveVisible")
        //- fades when approved
        .mt-40.rounded-2xlb.bg-indigo-950.p-24.mx-40.text-violet-650.transition.duration-500.delay-1000(:class="{'pointer-events-none opacity-50': approved}")
          p.text-base.leading-normal You must first #[b allow] the Drips contract to be able to #[b send&nbsp;your&nbsp;DAI].

          //- (tx message)
          form-message.my-28.border.border-current.rounded-lg(v-if="approveTxMsg", :body="approveTxMsg")

          //- allow btn
          .mt-24.flex.justify-center.-mb-4
            button.btn.btn-md.btn-violet.px-32.text-md.font-semibold.tracking-wide(@click.prevent="approve", :disabled="approved")
              template(v-if="approved") Allowed!
              template(v-else-if="approveTx") Allowing...
              template(v-else) Allow
          //- (tx link)
          tx-link(v-if="approveTx && !approved", :tx="approveTx", clss="text-sm")

      //- form buttons
      .mt-40.mb-6
        //- (tx message)
        form-message.my-40(v-if="txMsg", :body="txMsg")

        .flex.justify-center.w-full
          button.btn.btn-lg.btn-outline.px-36.mx-3(@click.prevent="dripType = null; dripAmt = 10") Cancel

          //- (view drip btn)
          template(v-if="txReceipt")
            button.btn.btn-violet.btn-lg.px-36.mx-3(@click.prevent="viewMyDrip") View your Drip

          //- (submit btn)
          template(v-else)
            button.btn.btn-lg.px-40.mr-8(type="submit", :disabled="tx", @mouseenter="txReceipt = null", :class="{'btn-violet': !txReceipt, 'btn-outline': txReceipt}")
              //- template(v-if="txReceipt") Dripped!
              //- template(v-else-if="tx") Sending...
              template(v-if="dripType === 'give'") Drip
              template(v-else) Confirm

        tx-link(v-if="tx", :tx="tx")

  //- (review splits)
  modal-splits-edit(v-if="confirmSplits", :open="confirmSplits", :newRecipient="{ receiverInput: dripToReceiver, percent: dripAmt }", @close="confirmSplits = false")
    template(v-slot:header)
      h6 Confirm Splitting Drips

    template(v-slot:description)
      p Review all the addresses you will now #[b.text-violet-650 split]<br>your incoming funds with.

  //- (review drips, monthly)
  modal-drips-edit(v-if="confirmDrips", :open="confirmDrips", :newRecipient="{ receiverInput: dripToReceiver, amount: dripAmt }", @close="confirmDrips = false")
    template(v-slot:header)
      h6 Confirm Drips

    template(v-slot:description)
      p Review your new monthly drip recipients and their amounts.

</template>
