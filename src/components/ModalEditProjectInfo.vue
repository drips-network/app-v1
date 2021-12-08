<script setup>
import { ref, toRaw } from 'vue'
import Modal from '@/components/Modal'
import {
  DialogTitle,
  DialogDescription
} from '@headlessui/vue'
import Panel from '@/components/Panel'
import FieldsProjectEdit from '@/components/FieldsProjectEdit'
import store, { pinJSONToIPFS } from '@/store'
import TxLink from '@/components/TxLink'

const props = defineProps(['meta', 'projectAddress'])
const emit = defineEmits(['close', 'updated'])

const newMeta = ref(toRaw(props.meta))
const status = ref()

const tx = ref()
const txReceipt = ref()

const update = async () => {
  try {
    status.value = 'Preparing...'
    const ipfsHash = await pinJSONToIPFS(toRaw(newMeta.value))

    tx.value = await store.dispatch('updateProjectMeta', { address: props.projectAddress, ipfsHash })
    console.log('new tx...', tx.value)

    status.value = 'Waiting...'
    txReceipt.value = await tx.value.wait()

    if (!txReceipt.value) {
      throw new Error('Transcation was not confirmed')
    }

    // success!
    status.value = 'Updated!'
    emit('updated', ipfsHash)
    setTimeout(() => emit('close'), 3000)
  } catch (e) {
    console.error(e)
    alert('An error occured: ' + e.message)
    status.value = null
  }
}
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="$emit('close')")

  panel.z-10.m-auto(icon="✏️")

    template(v-slot:header)
      dialog-title Edit Community

    form(@submit.prevent="update")
      fields-project-edit(v-model="newMeta")

      .mt-40.flex.justify-center
        button.btn.btn-lg.btn-outline.px-36.mr-4(@click="$emit('close')")
          | {{ tx || txReceipt ? 'Close' : 'Cancel' }}
        button.btn.btn-lg.btn-violet.px-36(type="submit", :disabled="status")
          | {{ status || 'Update' }}

    tx-link(v-if="tx", :tx="tx")

</template>
