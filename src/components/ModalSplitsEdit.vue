<script setup>
import { ref, computed, toRaw, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal'
import Panel from '@/components/Panel'
import InputBody from '@/components/InputBody'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle'
import SvgX from '@/components/SvgX'
import { DialogTitle, DialogDescription } from '@headlessui/vue'
import store from '@/store'
import TxLink from '@/components/TxLink'
import { formatSplits, validateAddressInput } from '@/utils'

const props = defineProps(['newRecipient'])
const emit = defineEmits(['close', 'updated'])
const router = useRouter()

const loading = ref(false)

const splits = ref([])

const addSplit = () => splits.value.push({ receiverInput: '', percent: null })
const removeSplit = i => splits.value.splice(i, 1)

let currentReceivers = []

const getSplits = async () => {
  try {
    // connected?
    if (!store.state.address) await store.dispatch('connect')
    // get...
    const receivers = await store.dispatch('getSplitsReceivers', store.state.address)
    currentReceivers = receivers.weights
    // console.log('curr', currentReceivers)
    // debugger

    // set splits
    const splits = toRaw(receivers.percents)

    // format for input
    for (var i = 0; i < splits.length; i++) {
      const ens = await store.dispatch('resolveAddress', { address: splits[i].address })
      splits[i].receiverInput = ens || splits[i].address
    }

    return splits
  } catch (e) {
    console.error(e)
    currentReceivers = [] // assume empty ?
    splits.value = []
  }
}

const tx = ref()
const txReceipt = ref()

const update = async () => {
  try {
    tx.value = null
    txReceipt.value = null

    // resolve receiver inputs
    const splitsResolved = []
    for (var i = 0; i < splits.value.length; i++) {
      const address = await validateAddressInput(splits.value[i].receiverInput)
      splitsResolved.push({ address, percent: splits.value[i].percent })
    }

    // format newReceivers param
    const newReceivers = formatSplits(splitsResolved)

    // submit...
    tx.value = await store.dispatch('updateAddressSplits', { currentReceivers, newReceivers })
    console.log('update splits tx', tx.value)

    txReceipt.value = await tx.value.wait()

    setTimeout(() => { tx.value = null }, 3000)
  } catch (e) {
    console.error(e)
    alert('Error: \n' + e.message || e)
  }
}

const viewMySplits = () => {
  emit('updated')
  emit('close')
  router.push({ name: 'user-drips-out', params: { address: store.state.address } })
}

onBeforeMount(async () => {
  try {
    loading.value = true
    splits.value = await getSplits()
    // add new recipient?
    if (props.newRecipient) {
      // check if exists...
      const existsAtIndex = splits.value.findIndex(split => {
        const input = props.newRecipient.receiverInput.toLowerCase()
        return split.receiverInput === input || split.address === input
      })

      // remove?
      if (existsAtIndex >= 0) {
        splits.value.splice(existsAtIndex, 1)
      }

      // add new to front
      splits.value = [toRaw(props.newRecipient), ...splits.value]
    }
    loading.value = false
  } catch (e) {
    console.error(e)
    loading.value = false
  }
})
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="$emit('close')")

  panel.z-10.m-auto(icon="💧")

    template(v-slot:header)
      dialog-title.leading-snug
        slot(name="header")

    template(v-slot:description)
      dialog-description.mx-auto.leading-relaxed(style="max-widthff:26em")
        slot(name="description")

    //- (loading...)
    template(v-if="loading")
      .h-80.animate-pulse.btn.btn-lg.btn-outline.text-violet-650.w-full Loading...

    //- (edit)
    template(v-else)
      form(@submit.prevent="update", validate)
        //- splits...
        //- TODO - make shared component with Create splits...
        template(v-for="(split, i) in splits")
          section.my-10.input-group.relative
            input-body(label="% of Incoming Funds", :isFilled="typeof splits[i].percent === 'number'", theme="dark")
              input(v-model="splits[i].percent", type="number", min="0.01", max="100", step="0.01", placeholder="5", required)
            //- input address
            .mt-10
              input-body(label="Ethereum/ENS Address", :isFilled="splits[i].receiverInput === 'length'", theme="dark", format="code")
                //- TODO: validate ethereum address
                input(v-model="splits[i].receiverInput", placeholder="name.eth", autocomplete="new-password", required)
            //- rmv btn
            .absolute.top-0.right-0.h-full.flex.items-center
              button.w-32.h-32.flex.items-center.justify-center.-mr-12.bg-indigo-900.rounded-full.border-violet-700.border-2.notouch_hover_border-white(@click.prevent="removeSplit(i)")
                svg-x.h-10.w-10(strokeWidth="2" strokeCap="round")

        button.mt-10.block.w-full.rounded-full.h-80.flex.items-center.justify-center.border.border-violet-500(@click.prevent="addSplit", style="border-style:dashed")
          svg-plus-minus-radicle

        //- btns
        .mt-40.flex.justify-center
          //- close btn
          button.btn.btn-outline.btn-lg.px-36.mr-8(@click.prevent="$emit('close')") Cancel
          //- update btn
          button.btn.btn-lg.px-36.mr-8(type="submit", :disabled="tx", @mouseenter="txReceipt = null", :class="{'btn-violet': !txReceipt, 'btn-outline': txReceipt}")
            template(v-if="txReceipt") Updated
            template(v-else-if="tx") Updating...
            template(v-else) Update
          //- (view)
          button.btn.btn-violet.btn-lg.px-36(v-if="txReceipt", @click="viewMySplits") View

        tx-link(v-if="tx", :tx="tx")

</template>
