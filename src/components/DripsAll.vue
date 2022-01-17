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
    .w-full.mb-60.flex.justify-center.stickyff.z-20.top-6
      .flex.bg-indigo-950.borderff.border-violet-700.rounded-full.items-center
        .h-44.w-44.flex.items-center.justify-center.text-base 💧
        .-ml-6.text-base.font-semibolffd.pr-20.text-violet-650
          | #[b {{ dripRows.length }} address] are #[b dripping] to others.
    //- info-bar.mb-20.text-md
      .w-full.text-center.px-32
        | #[b {{ dripRows.length }} address] are 💧 #[b dripping] to others.
    ul
      li(v-for="drip in dripRows")
        drip-row.my-4(:drip="drip")
</template>
