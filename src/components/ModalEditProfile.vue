<script setup>
import { ref, toRaw } from 'vue'
import Modal from '@/components/Modal'
import { DialogTitle, DialogDescription } from '@headlessui/vue'
import Panel from '@/components/Panel'
import FieldsProfileEdit from '@/components/FieldsProfileEdit'
import store, { pinJSONToIPFS } from '@/store'
import TxLink from '@/components/TxLink'
import FormMessage from '@/components/FormMessage'

const props = defineProps(['meta'])
const emit = defineEmits(['close', 'updated'])

const newMeta = ref({
  name: '',
  avatar: '',
  url: '',
  email: '',
  'com.twitter': '',
  github: '',
  discord: '',
  // 'telegram': '',
  // radicle: '',
  description: ''
})
// editing?
if (props.meta) {
  newMeta.value = toRaw(props.meta)
}

const status = ref()

const tx = ref()
const txReceipt = ref()
const txMsg = ref()

const update = async () => {
  try {
    tx.value = txMsg.value = txReceipt.value = null

    // upload to ipfs...
    txMsg.value = { message: 'Uploading to IPFS...' }
    const ipfsHash = await pinJSONToIPFS(toRaw(newMeta.value))
    txMsg.value = null

    // submit...
    txMsg.value = { message: 'Confirm the transaction in your wallet.' }
    tx.value = await store.dispatch('updateMetadata', { ipfsHash })
    console.log('update community info tx...', tx.value)

    // wait for tx...
    txMsg.value = { message: 'Waiting for transaction confirmation...' }
    txReceipt.value = await tx.value.wait()

    // success!
    emit('updated', ipfsHash)
    txMsg.value = { status: 1, message: 'Info updated!' }
    tx.value = null
    // setTimeout(() => emit('close'), 3000)
  } catch (e) {
    // console.error(e)
    // alert('An error occured: ' + e.message)
    // status.value = null
    txMsg.value = { status: -1, message: e.message || e }
  }
}
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="$emit('close')")

  panel.z-10.m-auto(icon="✏️")

    template(v-slot:header)
      dialog-title Edit Your Profile

    form(@submit.prevent="update")
      fields-profile-edit(v-model="newMeta")

      //- (tx message)
      form-message.my-40(v-if="txMsg", :body="txMsg")

      .mt-40.flex.justify-center
        //- cancel/close btn
        button.btn.btn-lg.btn-outline.px-36.mr-4(@click="$emit('close')")
          | {{ tx || txReceipt ? 'Close' : 'Cancel' }}

        //- submit btn
        button.btn.btn-lg.btn-violet.px-36(type="submit")
          //- template(v-if="txReceipt") Updated!
          template(v-if="tx") Updating...
          template(v-else) Update

    tx-link(v-if="tx", :tx="tx")

</template>
