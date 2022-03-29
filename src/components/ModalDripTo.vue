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
import { constants } from 'ethers'

const props = defineProps(['address'])

const dripAmt = ref(10)
const dripType = ref('monthly')

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

// const approved = ref(true) // check allowance on submit
// const approveTx = ref()

// const approve = async () => {
//   try {
//     // send...
//     state.approveTx = await store.dispatch('approveDAIContract', props.address)
//     console.log('approve tx', state.approveTx)

//     // wait for confirmation...
//     await state.approveTx.wait() // receipt

//     approved.value = topUpWei.value.toString()
//   } catch (e) {
//     console.error(e)
//     state.approved = false
//   }
// }

const confirmSplits = ref(false)
const confirmDrips = ref(false)

const dripTx = ref()
const drip = () => {
  if (dripType.value === 'split') {
    confirmSplits.value = true
  }
  if (dripType.value === 'monthly') {
    confirmDrips.value = true
  }
}

const emit = defineEmits(['close'])
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="$emit('close')")

  panel.z-10.m-auto(icon="💧")

    template(v-slot:header)
      dialog-title.leading-snug
        | Drip to #[addr.text-violet-650ff(:address="props.address", @ens="ens => { dripToReceiver = ens }")]

    template(v-slot:description)
      dialog-description.text-violet-650 How much would you like to drip?
      //- dialog-description.mx-auto.leading-relaxed(style="max-widthff:26em")
        template(v-if="dripType === 'monthly'")
          | Send DAI #[b.text-violet-650 every month.]
        template(v-if="dripType === 'split'")
          | Share a <b class="text-violet-650">percent</b> of your incoming funds.

    form(@submit.prevent="drip", validate)
      //- amount input
      input.h-80.w-full.flex.items-center.justify-center.rounded-full.border.border-violet-700.focus_border-violet-600.text-2xl.font-semibold(type="number", v-model="dripAmt", min="0.01", step="0.01")

      .mt-10.flex
        //- option monthly
        .w-1x2.pr-3
          input-radio.w-full(v-model="dripType", value="monthly", name="drip type") DAI/month
        //- option split
        .w-1x2.pl-3
          input-radio.w-full(v-model="dripType", value="split", name="drip type") % of drips

      //- input-body.mt-10(v-show="dripType === 'monthly'", label="Pre-pay Months")
        input(v-model="prePayMonths", type="number", min="1", step="1" required)

      .mt-40.mb-6
        button.btn.btn-lg.btn-violet.px-60.mx-auto(type="submit") Review

  modal-splits-edit(v-if="confirmSplits", :open="confirmSplits", :newRecipient="{ receiverInput: dripToReceiver, percent: dripAmt }", @close="confirmSplits = false")
    template(v-slot:header)
      h6 Confirm Drip Shares

    template(v-slot:description)
      p Review all the addresses you will now #[b.text-violet-650 share]<br>your incoming funds with.

  modal-drips-edit(v-if="confirmDrips", :open="confirmDrips", :newRecipient="{ receiverInput: dripToReceiver, amount: dripAmt }", @close="confirmDrips = false")
    template(v-slot:header)
      h6 Confirm Drips

    template(v-slot:description)
      p Review your new monthly drip recipients and their amounts.

</template>
