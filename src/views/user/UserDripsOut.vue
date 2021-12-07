<script setup>
import { computed, ref, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import DripRow from '@/components/DripRow'
import InfoBar from '@/components/InfoBar'
import LoadingBar from '@/components/LoadingBar'
import Addr from '@/components/Addr'
import store from '@/store'
import { toDAIPerMo } from '@/utils'
import ModalEditDripsSelect from '@/components/ModalEditDripsSelect'
import ModalDripsEdit from '@/components/ModalDripsEdit'
import ModalSplitsEdit from '@/components/ModalSplitsEdit'

const route = useRoute()

const loading = ref(true)
const splits = ref([])
const drips = ref([])

// editable
const canEdit = computed(() => store.getters.isWalletAddr(route.params.address))
const editDripsSelect = ref(false)
const edit = ref(null) // 'drips' : 'splits'

const splitsOut = computed(() => {
  return splits.value.map(split => ({
    sender: route.params.address,
    receiver: split.address,
    percent: split.percent
  }))
})

const dripsOut = computed(() => {
  return drips.value.map(drip => ({
    sender: route.params.address,
    receiver: drip[0],
    amount: toDAIPerMo(drip[1])
  }))
})

const allDrips = computed(() => [...dripsOut.value, ...splitsOut.value])

const getSplits = async () => {
  try {
    loading.value = true
    splits.value = (await store.dispatch('getSplitsReceivers', route.params.address)).percents
    loading.value = false
  } catch (e) {
    console.error(e)
    loading.value = false
  }
}

const getDrips = async () => {
  try {
    loading.value = true
    drips.value = (await store.dispatch('getDripsReceivers', route.params.address)).receivers
    loading.value = false
  } catch (e) {
    console.error(e)
    loading.value = false
  }
}

onBeforeMount(async () => {
  getDrips()
  getSplits()
})
</script>

<template lang="pug">
section.user-splits

  template(v-if="loading")
    loading-bar

  template(v-else)
    info-bar.mb-20.justify-center.px-32
      div
        template(v-if="canEdit") You are
        template(v-else) #[addr.font-bold(:address="$route.params.address")] is
        | &nbsp;<b>dripping</b> funds to <b>{{ allDrips.length }} address{{ allDrips.length === 1 ? '' : 'es' }}</b>

    ul
      li(v-for="drip in allDrips")
        drip-row.my-2(:drip="drip")

    //- editing...
    template(v-if="canEdit")
      //- btn
      template(v-if="allDrips.length")
        footer.w-full.sticky.bottom-20.left-0.w-full.mt-40.flex.justify-center
          button.btn.btn-lg.btn-violet.pl-36.pr-28(@click="editDripsSelect = true") Edit Drips 💧
      template(v-else)
        footer.mt-40.flex.justify-center
          button.btn.btn-lg.btn-outline.pl-36.pr-28(@click="editDripsSelect = true") Add Drips 💧

      //- select
      modal-edit-drips-select(:open="editDripsSelect", @close="editDripsSelect = false", @select="e => { edit = e; editDripsSelect = false }", :edit="allDrips.length")

      //- edit drips...
      modal-drips-edit(v-if="edit==='drips'", :open="edit === 'drips'", @close="edit = null; Drips", @updated="getDrips")
        template(v-slot:header)
          h6 Drip to Others
        template(v-slot:description)
          p {{ allDrips.length ? 'Edit the' : 'Add' }} addresses to drip funds to every month. Top-up your balance periodically to ensure funds are available!

      //- edit splits...
      modal-splits-edit(v-if="edit==='splits'", :open="edit === 'splits'", @close="edit = null; getSplits", @updated="getSplits")
        template(v-slot:header)
          h6 Share your drips
        template(v-slot:description)
          template(v-if="splits.length")
            | Edit the addresses you #[b.text-violet-650 share]<br>your incoming funds with.
          template(v-else)
            | Add addresses that you will #[b.text-violet-650 share]<br>your incoming funds with.

</template>
