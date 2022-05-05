<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import DripRow from '@/components/DripRow'
import InfoBar from '@/components/InfoBar'
import LoadingBar from '@/components/LoadingBar'
import Addr from '@/components/Addr'
import store from '@/store'
import { toDAI, toDAIPerMo } from '@/utils'
import api, { queryGivesByReceiver } from '@/api'

const route = useRoute()

const dripsIn = ref()
const splitsIn = ref()
const givesIn = ref()

const allDripsIn = computed(() => {
  if (!dripsIn.value && !splitsIn.value && !givesIn.value) return undefined
  const dIn = dripsIn.value || []
  const sIn = splitsIn.value || []
  const gIn = givesIn.value || []
  return [...dIn, ...sIn, ...gIn].sort((a, b) => b.timestamp - a.timestamp)
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
            dripsConfig {
              timestamp: lastUpdatedBlockTimestamp
            }
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
      amount: toDAIPerMo(entry.amtPerSec),
      timestamp: entry.dripsConfig.timestamp
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
            splitsConfig {
              timestamp: lastUpdatedBlockTimestamp
            }
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
      percent: entry.weight / store.state.splitsFractionMax * 100,
      timestamp: entry.splitsConfig.timestamp
    }))
  } catch (e) {
    console.error(e)
    splitsIn.value = []
  }
}

const getGivesIn = async () => {
  try {
    const resp = await api({ query: queryGivesByReceiver, variables: { address: route.params.address } })
    let gives = resp.data.gives
    // format for DripRow.vue
    gives = gives.map(give => {
      give.give = toDAI(give.amount)
      give.receiver = [give.receiver]
      delete give.amount
      return give
    })
    givesIn.value = gives
  } catch (e) {
    console.error(e)
  }
}

onBeforeMount(() => {
  getDripsIn()
  getSplitsIn()
  getGivesIn()
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
