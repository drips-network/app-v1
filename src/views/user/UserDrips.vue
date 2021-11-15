<script setup>
import UserNft from '@/components/UserNFT'
import { ref, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'

const route = useRoute()

const nfts = ref(null)

const fetchUserNFTs = (nftReceiver) => {
  return api({
    variables: { nftReceiver },
    query: `
      query ($nftReceiver: Bytes!) {
        nfts (where: {nftReceiver: $nftReceiver}) {
          id
          tokenId
          owner: nftReceiver
          projectAddress: nftRegistryAddress
          typeId: nftTypeId
          amtPerSec
        }
      }
    `
  })
}

onBeforeMount(async () => {
  try {
    const resp = await fetchUserNFTs(route.params.address)
    nfts.value = resp.data.nfts
  } catch (e) {
    console.error(e)
  }
})
</script>

<template lang="pug">
section.user-drips
  template(v-if="nfts")
    ul.flex.flex-wrap.px-20.w-full
      //- nfts...
      li.px-20.w-1x2.mb-40(v-for="nft in nfts")
        user-nft(:nft="nft")

  template(v-else)
    p.px-40 Loading...
</template>
