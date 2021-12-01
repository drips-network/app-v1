<script setup>
import { ref, computed } from 'vue'
import Modal from '@/components/Modal'
import Panel from '@/components/Panel'
import { DialogTitle, DialogDescription } from '@headlessui/vue'
import Addr from '@/components/Addr'
import InputBody from '@/components/InputBody'
import SvgDai from '@/components/SvgDai'
import { constants } from 'ethers'

const props = defineProps(['address'])

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
      dialog-title Drip to #[addr.text-violet-650(:address="props.address")]

    //- template(v-slot:description)
      dialog-description.text-base.mx-auto.leading-relaxed(style="max-width:26em")
        | Stream funds directly to #[addr.font-bold(:address="props.address")].
        br
        | Their income will also be shared among the addresses they've added as <b>Splits</b>.

    .h-80.border.btn.btn-outline.h-80.my-20

    .flex
      .w-1x2.bg-violet-600.h-80.flex.items-center.rounded-full.justify-center.text-xl DAI
      .w-1x2.bg-violet-600.h-80.flex.items-center.rounded-full.justify-center.text-xl %

    //- form(@submit.prevent, validate)

      //- input rate
      input-body.my-10(label="Monthly Rate (min 1)", symbol="dai")
        input(v-model="rate", type="number", placeholder="1", :min="minDAIPerMonth", step="1", required)

      //- input months prepay
      input-body.my-10(label="Pre-pay (Months)", :isFilled="typeof prePayMonths === 'number'")
        input(v-model="prePayMonths", type="number", placeholder="Pre-pay (Months)", min="1", step="1", required)

      //- total due
      .rounded-full.px-28.h-80.bg-indigo-700.flex.justify-between.items-center.font-semibold
        .text-lg TOTAL
        .text-2xl.flex.items-center
          | {{ payTotalDAI }}
          svg-dai.h-28.ml-16

      //- (approve btn)
      template(v-if="!approved")
        .mt-40.mb-12.flex.justify-center
          button.btn.btn-lg.btn-violet.min-w-sm.mx-auto(@click="approve")
            template(v-if="approveTx") Approving...
            template(v-else) 1. Approve

      //- (drip btn)
      template(v-else)
        .mt-40.mb-6.flex.justify-center
          button.btn.btn-lg.btn-violet.px-60.mx-auto(@click="drip", :disabled="!approved", :class="{'opacity-25': !approved}")
            template(v-if="dripTx") Submitting...
            template(v-else)
              template(v-if="!approved") 2.
              | Drip

</template>
