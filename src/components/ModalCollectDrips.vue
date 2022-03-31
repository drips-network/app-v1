<script setup>
import { ref, computed } from 'vue'
import Modal from '@/components/Modal.vue'
import Panel from '@/components/Panel.vue'
import AvailableFundsBar from '@/components/AvailableFundsBar.vue'
import TxLink from '@/components/TxLink.vue'
import SvgDai from '@/components/SvgDai.vue'
import { DialogTitle, DialogDescription } from '@headlessui/vue'
import { getDripPctFromAmts, round, toDAI } from '@/utils'
import store from '@/store'
import { utils } from 'ethers'
import FormMessage from '@/components/FormMessage.vue'

const props = defineProps(['projectAddress', 'amts', 'tx'])
const emit = defineEmits(['close', 'collected'])

const dripPct = ref(getDripPctFromAmts(props.amts))

const hasFunds = computed(() => props.amts && props.amts[0].add(props.amts[1]).gt(0))
const hasSplits = computed(() => props.amts && props.amts[1].gt(0))

const totalFunds = computed(() => props.amts ? toDAI(props.amts[0].add(props.amts[1])) : -1)
const toSplits = computed(() => props.amts ? toDAI(props.amts[1]) : -1)
const toOwner = computed(() => props.amts ? Number(utils.formatEther(props.amts[0])).toFixed(2) : -1)

const tx = ref()
const txReceipt = ref()
const txMsg = ref()
const collect = async () => {
  try {
    tx.value = null
    txMsg.value = null

    // collecting from hub or project?
    const params = props.projectAddress ? { projectAddress: props.projectAddress }
      : { address: store.state.address }

    // submit...
    txMsg.value = { message: 'Confirm the transaction in your wallet.' }
    tx.value = await store.dispatch('collectFunds', params)

    // wait for tx...
    txMsg.value = { message: 'Waiting for transaction confirmation...' }
    txReceipt.value = await tx.value.wait()
    tx.value = null

    // success!
    emit('collected')
    txMsg.value = { status: 1, message: 'Your funds have been collected!' }
    // setTimeout(() => emit('close'), 2000)
  } catch (e) {
    // alert('Error collecting drips: ' + e.message)
    txMsg.value = { status: -1, message: e.message || e }
    tx.value = null
  }
}
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="emit('close')")
  panel.z-10.m-auto(icon="💧")
    template(v-slot:header)
      dialog-title
        slot(name="header")

    template(v-slot:description)
      dialog-description
        p.mx-auto.leading-snug.text-violet-650ff(style="max-width:25em")
          template(v-if="!hasFunds")
            | There are no funds to collect.
          template(v-else)
            template(v-if="props.projectAddress")
              | Your membership has #[b collectable funds]!
            template(v-else)
              | You have #[b funds to collect]!
            template(v-if="hasSplits")
              br
              | You are dripping #[b {{ dripPct }}]% to other addresses.
              br
              | The&nbsp;rest will be transferred to your wallet.
            template(v-else)
              br
              | These funds can be transferred to your wallet.

    //- summary
    template(v-if="hasFunds")
      section
        //- collectable row
        .h-80.w-full.rounded-full.flex.justify-between.items-center.px-12.bg-indigo-700
          h4.ml-16.text-xl.font-semibold
            | Collectable

          .flex.items-center.mr-16
            .text-2xl.font-semibold.flex.items-center(:class="{'text-white': hasFunds}")
              | {{ totalFunds === -1 ? '...' : totalFunds }}
              svg-dai.ml-12(size="xl")

        //- (has splits)
        template(v-if="hasSplits")
          //- splits deduction row
          .h-80.mt-5.rounded-full.bg-indigo-700.flex.justify-between.items-center.px-12.text-violet-650
            .flex-1.flex.justify-between.items-center
              h4.ml-16.text-xl.font-semibold 💧 Dripping {{ dripPct }}%
              .flex.items-center.mr-16
                .text-2xl.font-semibold.flex.items-center
                  //- (less than ">")
                  template(v-if="props.amts && props.amts[1].gt(0) && Number(toSplits) < 0.01") >
                  //- (negative sign)
                  template(v-if="toSplits > 0") -
                  //- amount
                  | {{ toSplits !== -1 ? toSplits : '...' }}
                  //-
                  svg-dai.ml-12(size="xl")

          //- to owner row
          .h-80.mt-5.rounded-full.bg-indigo-700.flex.justify-between.items-center.px-12
            .flex-1.flex.justify-between.items-center
              h4.ml-16.text-xl.font-semibold
                | You Recieve

              .flex.items-center
                .text-2xl.font-semibold.mr-16.flex.items-center.text-white
                  | {{ toOwner > -1 ? toOwner : '...' }}
                  svg-dai.ml-12(size="xl")

    .mt-40
      //- (tx message)
      form-message.my-40(v-if="txMsg", :body="txMsg")

      //- btns
      .flex.justify-center.mb-6
        //- close btn
        button.btn.btn-lg.btn-outline.px-40.mr-6(@click="$emit('close')")
          | {{ tx || txReceipt || !hasFunds ? 'Close' : 'Cancel' }}

        //- (collect btn)
        button.btn.btn-lg.btn-violet.px-40(v-if="hasFunds", @click="collect", :disabled="tx")
          template(v-if="txReceipt") Collected
          template(v-else-if="tx") Collecting...
          template(v-else) Collect

      tx-link(v-if="tx", :tx="tx")
</template>
