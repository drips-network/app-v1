<script setup>
import { reactive, onBeforeMount } from 'vue'
import store from '@/store'

const props = defineProps({
  nft: Object
})

const state = reactive({
  projectMeta: {}
})

onBeforeMount(async () => {
  state.projectMeta = await store.dispatch('getProjectMeta', props.nft.projectAddress)
})
</script>

<template lang="pug">
.user-nft.shadow-md-blue.rounded-2xl.p-32
  h6.-mt-3.text-violet-600.text-xl.font-semibold
    router-link(:to="{name: 'project', params: { address: props.nft.projectAddress }}")
      | {{ state.projectMeta.name || '...' }}

  figure.my-40
    //- filler graphic
    .rounded-2xl.border.border-indigo-700.text-violet-600.aspect-w-16.aspect-h-9.relative
      .absolute.overlay.flex.items-center.justify-center
        | {{ '#' + props.nft.tokenId }}

  footer.flex.justify-end
    a.text-violet-600(:href="`https://testnets.opensea.io/assets/${props.nft.projectAddress}/${props.nft.tokenId}`", target="_blank", rel="noopener noreferrer") OpenSea ↗
</template>
