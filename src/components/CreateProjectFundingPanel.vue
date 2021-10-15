<script setup>
import { ref, computed, reactive } from 'vue'
import store from '@/store'
import Panel from '@/components/Panel'
import InputBody from '@/components/InputBody'
import { toWei } from '@/utils'

const props = defineProps({
  projectAddress: String
})

const minDAIPerMonth = ref(1)
const minWeiPerSec = computed(() => toWei(minDAIPerMonth.value).div(30 * 24 * 60 * 60))

const state = reactive({
  // typeId: route.query.typeId || 0,
  // minimum: 1,
  tx: null,
  txReceipt: null
})

const emit = defineEmits(['addedNFTType'])

const submit = async () => {
  try {
    state.tx = await store.dispatch('addProjectNFTType', {
      projectAddress: props.projectAddress,
      // typeId: state.typeId,
      minAmtPerSec: minWeiPerSec.value
    })
    state.txReceipt = await state.tx.wait()
    emit('addedNFTType')
  } catch (e) {
    console.error(e)
    state.tx = null
  }
}
</script>

<template lang="pug">
panel.mx-auto(icon="🌈")
  template(v-slot:header)
    h2 Funding

  //- p Now, set a monthly goal for your project and a minimum monthly amount for subscriptions.

  //- funding options as tiles
  .flex.-mx-10
    .w-1x2.px-10
      .aspect-w-1.aspect-h-1.relative.rounded-2xl.shadow-md-blue.border.border-violet-700(disabled)
        button.absolute.overlay.flex.items-center.justify-center
          div.pt-16
            .text-xl.font-semibold.mb-16 Subscriptions
            p.text-violet-600 Recurring income from<br>your community
        //- circle
        .m-20.h-32.w-32.border.border-violet-700.rounded-full.p-3.flex
          .bg-violet-700.rounded-full.w-full

    .w-1x2.px-10
      .aspect-w-1.aspect-h-1.relative.rounded-2xl.shadow-md-blue.opacity-50
        button.absolute.overlay.flex.items-center.justify-center.cursor-not-allowed(disabled)
          div.pt-16
            .text-xl.font-semibold.mb-16 One-off Sale
            p.text-violet-600 Create a limited edition<br> of single-purchase tokens.
        //- circle
        .m-20.h-32.w-32.border.border-violet-700.rounded-full.p-3.flex
          .bg-violet-700.rounded-full.w-full

  form.mt-40(@submit.prevent="submit", validate)
    //- input min rate
    input-body(label="Minimum Monthly Rate (DAI)", :isFilled="typeof minDAIPerMonth === 'number'")
      input(v-model="minDAIPerMonth", type="number", placeholder="Minimum Monthly Rate (DAI)", required)

    .mt-40
      //- submit btn
      button.btn.btn-lg.btn-white.mx-auto.min-w-sm(type="submit", :disabled="state.tx !== null")
        template(v-if="state.txReceipt") Added!
        template(v-else-if="state.tx") Adding...
        template(v-else) Confirm

      //- (tx link)
      .mt-16.text-violet-600(v-if="state.tx")
        a(:href="`https://rinkeby.etherscan.io/tx/${state.tx.hash}`", target="_blank", rel="noopener noreferrer") View Tx on Etherscan ↗

</template>
