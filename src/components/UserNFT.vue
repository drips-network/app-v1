<script setup>
import { ref, readonly, onBeforeMount } from 'vue'
import store from '@/store'

const props = defineProps({
  nft: Object
})

const nft = readonly(props.nft)
const projectAddress = readonly(props.nft.nftRegistryAddress)
const projectMeta = ref({})

onBeforeMount(async () => {
  projectMeta.value = await store.dispatch('getProjectMeta', projectAddress)
})
</script>

<template lang="pug">
.user-nft.shadow-md-blue.rounded-2xl.p-32
  h6.-mt-3.text-violet-600.text-xl.font-semibold
    router-link(:to="{name: 'project', params: { address: projectAddress }}")
      | {{ projectMeta.name || '...' }}

  figure.my-40
    //- filler graphic
    .rounded-2xl.border.border-indigo-700.text-violet-600.aspect-w-16.aspect-h-9.relative
      .absolute.overlay.flex.items-center.justify-center.text-center
        | NFT {{ '#' + nft.id }}<br>
        | Type {{ nft.nftTypeId.toString() }}<br>
        | {{ nft.amtPerSec }} DAI-WEI/sec

  footer.flex.justify-end
    a.text-violet-600(:href="`https://testnets.opensea.io/assets/${projectAddress}/${nft.id}`", target="_blank", rel="noopener noreferrer") OpenSea ↗
</template>
