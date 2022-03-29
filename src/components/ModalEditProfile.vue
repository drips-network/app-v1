<script setup>
import { ref, toRaw, computed, watch } from 'vue'
import Modal from '@/components/Modal.vue'
import { DialogTitle, DialogDescription } from '@headlessui/vue'
import Panel from '@/components/Panel.vue'
import FieldsProfileEdit from '@/components/FieldsProfileEdit.vue'
import store, { pinJSONToIPFS } from '@/store'
import TxLink from '@/components/TxLink.vue'
import FormMessage from '@/components/FormMessage.vue'

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

if (props.meta) {
  // clone so doesn't make it reactive...
  newMeta.value = JSON.parse(JSON.stringify(props.meta))
}

// watch for changes
const hasChanges = ref(false)
watch(newMeta, () => {
  hasChanges.value = props.meta !== undefined && JSON.stringify(props.meta) !== JSON.stringify(newMeta.value)
}, { deep: true })

const status = ref()
const tx = ref()
const txReceipt = ref()
const txMsg = ref()
const isUpdating = ref(false)

const update = async () => {
  try {
    tx.value = txMsg.value = txReceipt.value = null
    isUpdating.value = true

    // upload to ipfs...
    txMsg.value = { message: 'Uploading to IPFS...' }
    const ipfsHash = await pinJSONToIPFS(toRaw(newMeta.value))
    txMsg.value = null

    // submit...
    txMsg.value = { message: 'Confirm the transaction in your wallet.' }
    tx.value = await store.dispatch('profiles/updateSignerMetadata', { ipfsHash })
    console.log('update profile meta tx...', tx.value)

    // wait for tx...
    txMsg.value = { message: 'Waiting for transaction confirmation...' }
    txReceipt.value = await tx.value.wait()

    // success!
    emit('updated', ipfsHash)
    txMsg.value = { status: 1, message: 'Profile updated!' }
    tx.value = null
    isUpdating.value = false
    hasChanges.value = false // so "view" btn appears
  } catch (e) {
    console.error(e)
    isUpdating.value = false
    txMsg.value = { status: -1, message: e.message || e }
  }
}
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="$emit('close')")

  panel.z-10.m-auto(icon="✏️")

    template(v-slot:header)
      dialog-title Edit Your Profile

    template(v-slot:description)
      dialog-description
        p.mx-auto.leading-snug.text-violet-650(style="max-width:24em")
          | Edit the information on your profile<br>(or override any info from your ENS name.)

    form.mt-40(@submit.prevent="update")
      //- fields
      fields-profile-edit(v-model="newMeta")

      //- (tx message)
      form-message.my-40(v-if="txMsg", :body="txMsg")

      .mt-40.flex.justify-center
        //- (close/update btns)
        .flex(v-show="!txReceipt || hasChanges")
          //- close btn
          button.btn.btn-lg.btn-outline.px-36.mr-4(@click="$emit('close')")
            | {{ tx ? 'Close' : 'Cancel' }}
          //- submit btn
          button.btn.btn-lg.btn-violet.px-36(type="submit", :disabled="isUpdating", :class="{'opacity-50': isUpdating}")
            | Update

        //- (view btn)
        button.btn.btn-lg.btn-violet.px-36(v-show="txReceipt && !hasChanges", @click.stop="$emit('close')")
          | View Profile

    tx-link(v-if="tx", :tx="tx")

</template>
