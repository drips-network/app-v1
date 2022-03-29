<script setup>
import { ref, computed, toRaw, onBeforeMount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { formatSplits, validateAddressInput } from '@/utils'
import { DialogTitle, DialogDescription } from '@headlessui/vue'
import Panel from '@/components/Panel.vue'
import InputBody from '@/components/InputBody.vue'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle.vue'
import SvgX from '@/components/SvgX.vue'
import store from '@/store'
import TxLink from '@/components/TxLink.vue'
import LoadingBar from '@/components/LoadingBar.vue'
import FormMessage from '@/components/FormMessage.vue'
import WarningPolygonAddresses from '@/components/WarningPolygonAddresses.vue'

const props = defineProps(['newRecipient', 'cancelBtn', 'projectAddress'])
const emit = defineEmits(['close', 'updated', 'viewSplits'])
const router = useRouter()

const owner = computed(() => props.projectAddress || store.state.address)

const loading = ref(false)

const splits = ref([])

const addSplit = () => {
  splits.value.push({ receiverInput: '', percent: null })
  // focus new input
  nextTick().then(() => receiverInputEls.value[splits.value.length - 1].focus())
}
const removeSplit = i => splits.value.splice(i, 1)
const receiverInputEls = ref([])

let currentReceivers = []

const getSplits = async () => {
  try {
    // connected?
    if (!store.state.address) await store.dispatch('connect')
    // get... (from project if not-empty)
    const entries = await store.dispatch('getSplitsBySender', owner.value)
    // format for contract
    currentReceivers = entries.map(entry => ([entry.receiver, entry.weight]))

    // set splits
    const splits = entries

    // format for input
    for (var i = 0; i < splits.length; i++) {
      const profile = await store.dispatch('resolveAddress', { address: splits[i].receiver })
      splits[i].receiverInput = profile?.ens || splits[i].receiver
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
const txMsg = ref()

const update = async () => {
  try {
    tx.value = null
    txMsg.value = null
    txReceipt.value = null

    // resolve receiver inputs
    const splitsResolved = []
    for (var i = 0; i < splits.value.length; i++) {
      const address = await validateAddressInput(splits.value[i].receiverInput)
      splitsResolved.push({ address, percent: splits.value[i].percent })
    }

    // format newReceivers param
    const newReceivers = formatSplits(splitsResolved)

    // params
    const params = { currentReceivers, newReceivers }
    if (props.projectAddress) {
      params.projectAddress = props.projectAddress
    }

    // submit...
    txMsg.value = { message: 'Confirm the transaction in your wallet.' }
    tx.value = await store.dispatch('updateAddressSplits', params)
    console.log('update splits tx', tx.value)

    // wait for tx...
    txMsg.value = { message: 'Waiting for transaction confirmation...' }
    txReceipt.value = await tx.value.wait()

    // success
    emit('updated')
    txMsg.value = { status: 1, message: 'Confirmed! View your drips on your profile!' }
  } catch (e) {
    // console.error(e)
    // alert('Error: \n' + e.message || e)
    txMsg.value = { status: -1, message: e.message || e }
  }
}

const viewMySplits = () => {
  emit('close')
  emit('viewSplits')
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

    // empty? add empty row
    if (!splits.value.length) {
      addSplit()
    }

    loading.value = false
  } catch (e) {
    console.error(e)
    loading.value = false
  }
})
</script>

<template lang="pug">
panel(icon="💦")

  template(v-slot:header)
    slot(name="header")

  template(v-slot:description)
    .text-violet-650
      slot(name="description")

  //- (loading...)
  template(v-if="loading")
    loading-bar.w-full

  //- (edit)
  template(v-else)
    form(@submit.prevent="update", validate)
      //- splits...
      //- TODO - make shared component with Create splits...
      template(v-for="(split, i) in splits")
        section.my-10.input-group.relative
          //- input address
          input-body(:label="$store.getters.label('inputAddressLabel')", theme="dark", format="code")
            //- TODO: validate ethereum address
            input(:ref="el => { receiverInputEls[i] = el }", v-model="splits[i].receiverInput", :placeholder="$store.getters.label('inputAddressPlaceholder')", autocomplete="new-password", required)
          //- amount
          input-body.mt-10(label="Percent", theme="dark", symbol="percent")
            input(v-model="splits[i].percent", type="number", min="0.01", max="100", step="0.01", placeholder="5", required)
          //- rmv btn
          .absolute.top-0.right-0.h-full.flex.items-center
            button.w-32.h-32.flex.items-center.justify-center.-mr-12.bg-indigo-900.rounded-full.border-violet-700.border-2.notouch_hover_border-white(@click.prevent="removeSplit(i)")
              svg-x.h-10.w-10(strokeWidth="2" strokeCap="round")

      button.mt-10.btn.btn-lg.btn-indigo.w-full(@click.prevent="addSplit", aria-label="Add Split")
        svg-plus-minus-radicle

      //- btns
      .mt-40
        //- (polygon address warning)
        template(v-if="$store.getters.isPolygon")
          warning-polygon-addresses.my-40

        //- (tx message)
        form-message.my-40(v-if="txMsg", :body="txMsg")

        .flex.justify-center
          //- close btn
          template(v-if="props.cancelBtn")
            button.btn.btn-outline.btn-lg.px-36.mr-8(@click.prevent="$emit('close')")
              | {{ txReceipt ? 'Close' : 'Cancel' }}

          //- (view btn)
          template(v-if="txReceipt")
            button.btn.btn-violet.btn-lg.px-36(@click.prevent="viewMySplits") View your Drips

          //- (update btn)
          template(v-else)
            button.btn.btn-lg.px-36.mr-8(type="submit", :disabled="tx", @mouseenter="txReceipt = null", :class="{'btn-violet': !txReceipt, 'btn-outline': txReceipt}")
              template(v-if="txReceipt") Updated
              template(v-else-if="tx") Updating...
              template(v-else) Update

        tx-link(v-if="tx", :tx="tx")

</template>
