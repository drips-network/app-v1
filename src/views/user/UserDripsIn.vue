<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import DripRow from '@/components/DripRow.vue'
import InfoBar from '@/components/InfoBar.vue'
import LoadingBar from '@/components/LoadingBar.vue'
import Addr from '@/components/Addr.vue'
import store from '@/store'
import { toDAIPerMo } from '@/utils'
import api from '@/api'

const route = useRoute()

const dripsIn = ref()
const splitsIn = ref()

const allDripsIn = computed(() => {
  if (!dripsIn.value && !splitsIn.value) return undefined
  const dIn = dripsIn.value || []
  const sIn = splitsIn.value || []
  return [...dIn, ...sIn]
})

const getDripsIn = async () => {
  try {
    // fetch...
    const resp = await api({
      query: `
        query ($receiver: Bytes!) {
          dripsEntries (where: { receiver: $receiver }) {
            sender: user
            receiver
            amtPerSec
          }
        }
        `,
      variables: { receiver: route.params.address.toLowerCase() }
    })
    console.log(resp)
    // format
    dripsIn.value = resp.data?.dripsEntries.map(entry => ({
      ...entry,
      receiver: [entry.receiver],
      amount: toDAIPerMo(entry.amtPerSec)
    }))
  } catch (e) {
    console.error(e)
    dripsIn.value = []
  }
}

const getSplitsIn = async () => {
  try {
    // fetch...
    const resp = await api({
      query: `
        query ($receiver: Bytes!) {
          splitsEntries (where: { receiver: $receiver }) {
            sender
            receiver
            weight
          }
        }
        `,
      variables: { receiver: route.params.address.toLowerCase() }
    })
    console.log(resp)
    // format
    splitsIn.value = resp.data?.splitsEntries.map(entry => ({
      ...entry,
      receiver: [entry.receiver],
      percent: entry.weight / store.state.splitsFractionMax * 100
    }))
  } catch (e) {
    console.error(e)
    splitsIn.value = []
  }
}

onBeforeMount(() => {
  getDripsIn()
  getSplitsIn()
})
</script>

<template lang="pug">
section.user-drips-in

  //- (loading bar)
  template(v-if="allDripsIn === undefined")
    loading-bar

  //-
  template(v-else)
    info-bar.mb-20.justify-center.px-32
      div
        | <b>{{ allDripsIn.length }} address{{ allDripsIn.length === 1 ? '' : 'es' }}</b>
        | {{ allDripsIn.length === 1 ? ' is ' : ' are ' }}
        | <b>dripping funds</b> to&nbsp;
        b(v-if="$store.getters.isWalletAddr($route.params.address)") you
        addr.font-bold(v-else, :address="$route.params.address")

    ul
      li(v-for="drip in allDripsIn")
        drip-row.my-2(:drip="drip", :alternateColors="true")

</template>
