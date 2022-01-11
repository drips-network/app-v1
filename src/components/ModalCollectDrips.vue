<script setup>
import { ref, computed } from 'vue'
import Modal from '@/components/Modal'
import Panel from '@/components/Panel'
import AvailableFundsBar from '@/components/AvailableFundsBar'
import TxLink from '@/components/TxLink'
import { DialogTitle, DialogDescription } from '@headlessui/vue'
import { getDripPctFromAmts } from '@/utils'
import store from '@/store'
const props = defineProps(['amts', 'tx'])
const emit = defineEmits(['close', 'collected'])

const dripPct = ref(getDripPctFromAmts(props.amts))
const hasFunds = computed(() => props.amts && props.amts[0].add(props.amts[0]).gt(0))

const tx = ref()
const txReceipt = ref()
const collect = async () => {
  try {
    tx.value = await store.dispatch('collectFunds', { address: store.state.address })
    txReceipt.value = await tx.value.wait()
    tx.value = null
    setTimeout(() => {
      emit('close')
      emit('collected')
    }, 2000)
  } catch (e) {
    alert('Error collecting drips: ' + e.message)
    tx.value = null
  }
}

// const getDripPctFromReceivers = async () => {
//   try {
//     if (isNaN(dripPct.value)) {
//       const percents = (await store.dispatch('getSplitsReceivers', store.state.address)).percents
//       dripPct.value = percents.reduce((acc, curr) => acc + curr.percent, 0)
//     }  
//   } catch (e) {
//     console.error(e)
//   }
// }
// onMounted(() => getDripPctFromReceivers())
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="emit('close')")
  panel.z-10.m-auto(icon="💧")
    template(v-slot:header)
      dialog-title Collect your Drips
    template(v-slot:description)
      dialog-description
        p.mx-auto.leading-snug.text-violet-650(style="max-width:25em")
          template(v-if="!hasFunds")
            | You don't have any funds to collect.
          template(v-else)
            | You have funds available to collect!
            template(v-if="amts[1].gt(0)")
              br
              | #[b.text-violet-650 {{ dripPct }}% will be shared] with your #[b.text-violet-650 drip %] recipients. The&nbsp;rest will be transferred to your wallet.

    div(v-if="hasFunds")
      available-funds-bar.bg-indigo-700(:amts="props.amts", :tx="tx", :isModalSummary="true", :dripPct="dripPct")
        template(v-slot:allfunds) Current Funds
        template(v-slot:toyou)
          span.text-white You Receive

    .mt-40.flex.justify-center.mb-6
      button.btn.btn-lg.btn-outline.px-40.mr-6(@click="$emit('close')")
        | {{ tx || txReceipt || !hasFunds ? 'Close' : 'Cancel' }}
      
      button.btn.btn-lg.btn-violet.px-40(v-if="hasFunds", @click="collect", :disabled="tx")
        template(v-if="txReceipt") Collected
        template(v-else-if="tx") Collecting...
        template(v-else) Collect

    tx-link(v-if="tx", :tx="tx")
</template>