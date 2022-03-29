<script setup>
import { ref, computed, toRaw, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Panel from '@/components/Panel.vue'
import InputBody from '@/components/InputBody.vue'
import TxLink from '@/components/TxLink.vue'
import SvgX from '@/components/SvgX.vue'
import SvgDai from '@/components/SvgDai.vue'
import LoadingBar from '@/components/LoadingBar.vue'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle.vue'
import FormMessage from '@/components/FormMessage.vue'
import WarningPolygonAddresses from '@/components/WarningPolygonAddresses.vue'
import { DialogTitle, DialogDescription } from '@headlessui/vue'
import { utils, constants, BigNumber as bn } from 'ethers'
import { round, toDAI, toWei, toWeiPerSec, toDAIPerMo, validateAddressInput } from '@/utils'
import store from '@/store'

const props = defineProps(['newRecipient', 'cancelBtn'])
const emit = defineEmits(['close', 'updated'])
const router = useRouter()

const loading = ref(false)

const drips = ref([])

const topUpDAI = ref(0) // DAI

const addDrip = () => {
  drips.value = drips.value || []
  drips.value.push({ receiverInput: '', amount: null })
  nextTick().then(() => receiverInputEls.value[drips.value.length - 1].focus())
}
const removeDrip = i => drips.value.splice(i, 1)
const receiverInputEls = ref([])

let lastUpdate = null

let getWithdrawable
const withdrawable = ref('0')
// balance (max DAI withdrawable
const balance = computed(() => toDAI(withdrawable.value), 'exact')
const newBalance = computed(() => round(Number(balance.value) + topUpDAI.value))

const getDrips = async () => {
  try {
    // connected?
    if (!store.state.address) await store.dispatch('connect')
    // get...
    lastUpdate = await store.dispatch('getDripsBySender', store.state.address)

    // set withdrawable
    getWithdrawable = lastUpdate.withdrawable
    withdrawable.value = getWithdrawable()

    // set receivers
    const receivers = toRaw(lastUpdate.receivers)

    // format receivers for form input
    const receiversFormatted = []
    for (var i = 0; i < receivers.length; i++) {
      // get profile...
      const profile = await store.dispatch('resolveAddress', { address: receivers[i][0] })
      // format
      receiversFormatted.push({
        address: receivers[i].receiver, // receivers[i][0],
        amount: toDAIPerMo(receivers[i].amtPerSec), // toDAIPerMo(receivers[i][1]),
        receiverInput: profile?.ens || receivers[i].receiver, // profile?.ens || receivers[i][0]
      })
    }

    return receiversFormatted
  } catch (e) {
    console.error(e)
    drips.value = []
  }
}

const approved = ref(true) // assume true to start
const approveTx = ref()
const approveVisible = ref(false)
const approveTxMsg = ref()

const approve = async () => {
  try {
    approveTxMsg.value = null

    // send...
    approveTxMsg.value = { message: 'Confirm the transaction in your wallet.' }
    approveTx.value = await store.dispatch('approveDAIContract')
    console.log('approve tx...', approveTx.value)

    // wait for confirmation...
    approveTxMsg.value = { message: 'Waiting for transaction confirmation...' }
    await approveTx.value.wait() // receipt

    approved.value = true // topUpWei.value.toString()
    approveTx.value = null
    approveTxMsg.value = null
  } catch (e) {
    // console.error(e)
    approveTxMsg.value = { status: -1, message: e.message || e }
  }
}

const tx = ref()
const txReceipt = ref()
const txMsg = ref()

const update = async () => {
  try {
    tx.value = null
    txReceipt.value = null
    txMsg.value = null

    const topUpWei = toWei(topUpDAI.value) // .toString()

    // check allowance if top-up
    if (topUpWei.gt(0)) {
      const allowance = await store.dispatch('getAllowance') // of dripsHub

      // !! below allowance
      if (allowance.lt(topUpWei)) {
        // alert('You must first approve the contract to be able to withdraw your DAI.')
        approved.value = false
        approveVisible.value = true
        return false
      }
    }

    // check max if withdrawing
    if (topUpWei.lt(0)) {
      withdrawable.value = await getWithdrawable()
      // !! can't withdraw that much
      if (topUpWei.abs().gt(withdrawable.value)) {
        txMsg.value = { message: `You can only withdraw ${balance.value} DAI.` }
        return false
      }
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
    txMsg.value = { message: 'Confirm the transaction in your wallet.' }
    tx.value = await store.dispatch('updateUserDrips', {
      lastUpdate: lastUpdate.timestamp,
      lastBalance: lastUpdate.balance,
      currentReceivers: lastUpdate.receivers,
      balanceDelta: topUpWei,
      newReceivers
    })
    console.log('update drips tx', tx.value)

    // wait for tx...
    txMsg.value = { message: 'Waiting for transaction confirmation...' }
    txReceipt.value = await tx.value.wait()

    // confirmed!
    txMsg.value = { status: 1, message: 'Confirmed! View your drips on your profile.' }
    tx.value = null
    emit('updated')
    // update list, balance
    getDrips()
    topUpDAI.value = 0
  } catch (e) {
    txMsg.value = { status: -1, message: e.data?.message || e.message || e }
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

      // recipient exists already? remove
      if (existsAtIndex >= 0) {
        drips.value.splice(existsAtIndex, 1)
      }

      // add new recipient to front
      drips.value = [toRaw(props.newRecipient), ...drips.value]
    }

    // if empty drips, add empty row
    if (!drips.value?.length) {
      addDrip()
    }

    loading.value = false
  } catch (e) {
    console.error(e)
    loading.value = false
  }
})
</script>

<template lang="pug">
panel(icon="💧")

  template(v-slot:header)
    .leading-snug
      h2 Drip Monthly

  template(v-slot:description)
    p.text-violet-650.mx-auto.leading-relaxed
      | Who do you want to send DAI to #[b every month]?

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
          input-body(:label="$store.getters.label('inputAddressLabel')", :isFilled="drips[i].receiverInput === 'length'", theme="dark", format="code")
            //- TODO: validate ethereum address
            input(:ref="el => { receiverInputEls[i] = el }", v-model="drips[i].receiverInput", :placeholder="$store.getters.label('inputAddressPlaceholder')", autocomplete="new-password", required)
          //- rate
          input-body.mt-10(label="Monthly DAI Amount", :isFilled="typeof drips[i].amount === 'number'", theme="dark", symbol="daipermo")
            input(v-model="drips[i].amount", type="number", min="0.01", step="0.01", placeholder="5", required)

          //- delete row btn (X)
          .absolute.top-0.right-0.h-full.flex.items-center
            button.w-32.h-32.flex.items-center.justify-center.-mr-12.bg-indigo-900.rounded-full.border-violet-700.border-2.notouch_hover_border-white(@click.prevent="removeDrip(i)")
              svg-x.h-10.w-10(strokeWidth="2" strokeCap="round")

      //- add drip row btn
      button.mt-10.btn.btn-lg.btn-indigo.w-full(@click.prevent="addDrip")
        svg-plus-minus-radicle

      //- topup section
      .mt-72
        div.mb-24.text-3xl 🔋
        h6.text-2xl.font-semibold.leading-snug Add Funds
        p.mt-24.mb-40.text-md.mx-auto.text-violet-650.leading-tight(style="max-width:26em") Monthly drips are sent from a #[b.text-violet-650 separate balance] than your wallet. #[b.text-violet-650 Add funds] so your drips don't run out.

        //- balance
        .h-80.flex.justify-between.items-center.rounded-full.bg-indigo-700
          .pl-32.text-xl.font-semibold
            | Balance
          .pr-20.flex.items-center(:class="{'text-red-500ff': newBalance < Number(balance), 'text-greenbright-500ff': newBalance > Number(balance) }")
            span.text-2xl.font-semibold {{ newBalance }}
            svg-dai.ml-12(size="xl")

        //- input
        .relative.my-10
          input-body(label="Add DAI to Balance", symbol="dai")
            input(v-model="topUpDAI", type="number", step="0.01", required, :min="-1 * Number(balance)")
          //- (max withdraw note)
          .absolute.bottom-0.left-0.w-full.text-center.text-sm.text-red-600.pb-4(v-if="topUpDAI < -balance")
            template(v-if="balance && Number(balance) > 0") Max Withdraw -{{balance}} DAI
            template(v-else) There are no funds to withdraw

      //- (polygon address warning)
      template(v-if="$store.getters.isPolygon")
        warning-polygon-addresses.my-40
      
      //- (not approved message)
      template(v-if="approveVisible")
        //- fades when approved
        .mt-40.rounded-2xlb.bg-indigo-950.p-24.mx-40.text-violet-650.transition.duration-500.delay-1000(:class="{'pointer-events-none opacity-50': approved}")
          p.text-base.leading-normal You must first #[b allow] the Drips contract to be able to #[b withdraw&nbsp;your&nbsp;DAI].

          //- (tx message)
          form-message.my-28.border.border-current.rounded-lg(v-if="approveTxMsg", :body="approveTxMsg")

          //- allow btn
          .mt-24.flex.justify-center.-mb-4
            button.btn.btn-md.btn-violet.px-32.text-md.font-semibold.tracking-wide(@click.prevent="approve", :disabled="approved")
              template(v-if="approved") Allowed!
              template(v-else-if="approveTx") Allowing...
              template(v-else) Allow
          //- (tx link)
          tx-link(v-if="approveTx && !approved", :tx="approveTx", clss="text-sm")

      //- btns
      .mt-40

        //- (tx message)
        form-message.my-40(v-if="txMsg", :body="txMsg")

        .flex.justify-center
          //- (close btn)
          template(v-if="props.cancelBtn")
            button.btn.btn-outline.btn-lg.px-36.mr-8(@click.prevent="$emit('close')") Cancel

          //- (view btn)
          template(v-if="txReceipt")
            button.btn.btn-violet.btn-lg.px-36(@click.prevent="viewMyDrips") View your Drips

          //- (approve btn)
          //- template(v-else-if="!approved")
            button.btn.btn-lg.btn-violet.px-36.mr-8(@click.prevent="approveDAI")
              template(v-if="approveTx") Approving...
              template(v-else) Approve

          //- (submit btn)
          template(v-else)
            button.btn.btn-lg.px-40.mr-8(type="submit", :disabled="tx", @mouseenter="txReceipt = null", :class="{'btn-violet': !txReceipt, 'btn-outline': txReceipt}")
              template(v-if="txReceipt") Success!
              template(v-else-if="tx") Submitting...
              template(v-else) Submit

        tx-link(v-if="tx", :tx="tx")

</template>
