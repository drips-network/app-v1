<script setup>
import { computed } from 'vue'
import store from '@/store'
import DripRow from '@/components/DripRow'
import LoadingBar from '@/components/LoadingBar'
import InfoBar from '@/components/InfoBar'
import { round, formatSplitsEvents } from '@/utils'

const props = defineProps(['splits'])
const dripRows = computed(() => props.splits && formatSplitsEvents(props.splits))
</script>

<template lang="pug">
section
  template(v-if="!dripRows")
    loading-bar
  template(v-else)
    info-bar.mb-20.text-md
      .w-full.text-center.px-32
        | #[b {{ dripRows.length }} address] are 💧 #[b dripping] to others.
    ul
      li(v-for="drip in dripRows")
        drip-row.my-4(:drip="drip")
</template>
