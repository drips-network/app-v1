<script setup>
import { ref, computed, toRaw, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal'
import Panel from '@/components/Panel'
import InputBody from '@/components/InputBody'
import TxLink from '@/components/TxLink'
import SvgX from '@/components/SvgX'
import LoadingBar from '@/components/LoadingBar'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle'
import { DialogTitle, DialogDescription } from '@headlessui/vue'
import store from '@/store'
import { utils, constants } from 'ethers'
import { toWei, toWeiPerSec, toDAIPerMo, validateAddressInput } from '@/utils'

const props = defineProps(['newRecipient'])
const emit = defineEmits(['close', 'updated'])
const router = useRouter()

const loading = ref(false)

const drips = ref([])

const topUp = ref(0) // DAI

const addDrip = () => drips.value.push({ address: '', amtPerSec: null })
const removeDrip = i => drips.value.splice(i, 1)

let lastUpdate = null

const getDrips = async () => {
  try {
    // connected?
    if (!store.state.address) await store.dispatch('connect')
    // get...
    lastUpdate = await store.dispatch('getDripsReceivers', store.state.address)

    // set drips
    const receivers = toRaw(lastUpdate.receivers)

    // format for form input
    const receiversFormatted = []
    for (var i = 0; i < receivers.length; i++) {
      const ens = await store.dispatch('resolveAddress', { address: receivers[i][0] })
      receiversFormatted.push({
        address: receivers[i][0],
        amount: toDAIPerMo(receivers[i][1]),
        receiverInput: ens || receivers[i][0]
      })
    }

    return receiversFormatted
  } catch (e) {
    console.error(e)
    currentReceivers = [] // assume empty ?
    drips.value = []
  }
}

const approvedDAI = ref(true) // assume true to start
const approveTx = ref()

const approveDAI = async () => {
  try {
    // send...
    approveTx.value = await store.dispatch('approveDAIContract', props.projectAddress)
    console.log('approve tx...', approveTx.value)

    // wait for confirmation...
    await approveTx.value.wait() // receipt

    approvedDAI.value = true // topUpWei.value.toString()
  } catch (e) {
    console.error(e)
    approvedDAI.value = false
  }
}

const tx = ref()
const txReceipt = ref()

const update = async () => {
  try {
    tx.value = null
    txReceipt.value = null
    const topUpWei = toWei(topUp.value).toString()

    // check allowance
    const allowance = await store.dispatch('getAllowance') // of dripsHub

    // !! below allowance
    if (allowance.lt(topUpWei)) {
      alert('You must first approve the contract to withdraw your DAI periodically.')
      approvedDAI.value = false
      return false
    }

    // validate receivers
    let newReceivers = []
    for (var i = 0; i < drips.value.length; i++) {
      // validate address input...
      const address = await validateAddressInput(drips.value[i].receiverInput)
      // convert rate to wei
      const amtPerSec = toWeiPerSec(drips.value[i].amount)
      // add
      newReceivers.push([address, amtPerSec])
    }
    // sort by address
    newReceivers = newReceivers.sort((a, b) => (a[0] - b[0]))

    // submit...
    tx.value = await store.dispatch('updateUserDrips', {
      // account: store.state.address,
      lastUpdate: lastUpdate.timestamp, // 0, // block.timestamp,
      lastBalance: lastUpdate.balance, // 0, //
      currentReceivers: lastUpdate.receivers,
      balanceDelta: topUpWei,
      newReceivers
    })
    console.log('update drips tx', tx.value)

    txReceipt.value = await tx.value.wait()

    setTimeout(() => { tx.value = null }, 3000)
  } catch (e) {
    console.error(e)
    alert('Error updating Drips: \n' + (e.message || e))
  }
}

const viewMyDrips = () => {
  emit('updated')
  emit('close')
  router.push({ name: 'user-drips-out', params: { address: store.state.address } })
}

onMounted(async () => {
  try {
    loading.value = true
    drips.value = await getDrips()
    // add new recipient?
    if (props.newRecipient) {
      // check if exists...
      const existsAtIndex = drips.value.findIndex(drip => {
        const input = props.newRecipient.receiverInput.toLowerCase()
        return drip.receiverInput === input || drip.address === input
      })

      // remove?
      if (existsAtIndex >= 0) {
        drips.value.splice(existsAtIndex, 1)
      }

      // add new to front
      drips.value = [toRaw(props.newRecipient), ...drips.value]
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
      loading-bar.w-full

    //- (edit)
    template(v-else)
      form(@submit.prevent="update", validate)
        //- drips...
        template(v-for="(drip, i) in drips")
          section.my-10.input-group.relative
            //- address
            input-body(label="Ethereum/ENS Address", :isFilled="drips[i].receiverInput === 'length'", theme="dark", format="code")
              //- TODO: validate ethereum address
              input(v-model="drips[i].receiverInput", placeholder="name.eth", autocomplete="new-password", required)
            //- rate
            input-body.mt-10(label="DAI per month", :isFilled="typeof drips[i].amount === 'number'", theme="dark", symbol="daipermo")
              input(v-model="drips[i].amount", type="number", min="0.01", max="100", step="0.01", placeholder="5", required)

            //- delete row btn (X)
            .absolute.top-0.right-0.h-full.flex.items-center
              button.w-32.h-32.flex.items-center.justify-center.-mr-12.bg-indigo-900.rounded-full.border-violet-700.border-2.notouch_hover_border-white(@click.prevent="removeDrip(i)")
                svg-x.h-10.w-10(strokeWidth="2" strokeCap="round")

        //- add drip row btn
        button.mt-10.block.w-full.rounded-full.h-80.flex.items-center.justify-center.border.border-violet-500(@click.prevent="addDrip", style="border-style:dashed")
          svg-plus-minus-radicle

        //- TODO topup input

        //- .mt-20
          .text-md.font-semibold.text-center.mb-8 Current Balance
          .h-80.btn.btn-outline.btn-lg 0

          input-body.mt-10(label="Add to Balance")

        //- btns
        .mt-40.flex.justify-center
          //- close btn
          button.btn.btn-outline.btn-lg.px-36.mr-8(@click.prevent="$emit('close')") Cancel

          //- (approve btn)
          template(v-if="!approvedDAI")
            button.btn.btn-lg.btn-violet.px-36.mr-8(@click.prevent="approveDAI")
              template(v-if="approveTx") Approving...
              template(v-else) Approve

          //- (update btn)
          template(v-else)
            button.btn.btn-lg.px-36.mr-8(type="submit", :disabled="tx", @mouseenter="txReceipt = null", :class="{'btn-violet': !txReceipt, 'btn-outline': txReceipt}")
              template(v-if="txReceipt") Updated
              template(v-else-if="tx") Updating...
              template(v-else) Update
          //- (view)
          button.btn.btn-violet.btn-lg.px-36(v-if="txReceipt", @click="viewMyDrips") View

        tx-link(v-if="approveTx", :tx="approveTx")
        tx-link(v-if="tx", :tx="tx")

</template>
