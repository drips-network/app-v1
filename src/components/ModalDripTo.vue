<script setup>
import { ref, computed } from 'vue'
import Modal from '@/components/Modal'
import Panel from '@/components/Panel'
import { DialogTitle, DialogDescription } from '@headlessui/vue'
import Addr from '@/components/Addr'
import InputBody from '@/components/InputBody'
import InputRadio from '@/components/InputRadio'
import SvgDai from '@/components/SvgDai'
import { constants } from 'ethers'

const props = defineProps(['address'])

const dripAmt = ref(10)
const dripType = ref('monthly')

// const minDAIPerSec = constants.WeiPerEther // 1 DAI (bn)
const minDAIPerMonth = 1 // minDAIPerSec.mul(30 * 24 * 60 * 60) // bn

const rate = ref(minDAIPerMonth) // Math.max(1, minDAIPerMonth.toNumber())) // min at least 1...
const prePayMonths = ref(1)
const payTotalDAI = computed(() => rate.value * prePayMonths.value)

const approved = ref(true) // check allowance on submit
const approveTx = ref()

const topUpWei = computed(() => {
  return constants.WeiPerEther.mul(payTotalDAI.value)
})
const weiPerSec = computed(() => {
  return constants.WeiPerEther.mul(rate.value).div(30 * 24 * 60 * 60)
})

const approve = async () => {
  try {
    // send...
    state.approveTx = await store.dispatch('approveDAIContract', props.address)
    console.log('approve tx', state.approveTx)

    // wait for confirmation...
    await state.approveTx.wait() // receipt

    approved.value = topUpWei.value.toString()
  } catch (e) {
    console.error(e)
    state.approved = false
  }
}

const dripTx = ref()
const drip = () => {}

const emit = defineEmits(['close'])
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="$emit('close')")

  panel.z-10.m-auto(icon="💧")

    template(v-slot:header)
      dialog-title.leading-snug Drip to<br>#[addr.text-violet-650(:address="props.address")]

    template(v-slot:description)
      dialog-description.mx-auto.leading-relaxed(style="max-widthff:26em")
        template(v-if="dripType === 'monthly'")
          | Stream DAI on a <b>monthly</b> basis.
        template(v-if="dripType === 'split'")
          | Share a <b>percent</b> of your incoming funds.

    form(@submit.prevent, validate)
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
        button.btn.btn-lg.btn-violet.px-60.mx-auto.tracking-wider Drip 💧

</template>
