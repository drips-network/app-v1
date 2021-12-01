<script setup>
import { ref, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
import UserNft from '@/components/UserNFT'
import InfoBar from '@/components/InfoBar'
import Addr from '@/components/Addr'
import LoadingBar from '@/components/LoadingBar'

const route = useRoute()

const nfts = ref()

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
    nfts.value = resp.data.nfts || []
  } catch (e) {
    console.error(e)
  }
})
</script>

<template lang="pug">
section.user-memberships
  //- .flex.justify-center.mb-40
    .mx-auto.bg-indigo-800.rounded-2xlb.py-24.px-32.text-md.text-violet-650
      | <b>Drips</b> from <b>Memberships</b> appear here.

  template(v-if="nfts")
    info-bar.mb-20.justify-center.px-32
      div
        template(v-if="$store.getters.isWalletAddr($route.params.address)") You
        template(v-else) #[addr.font-bold(:address="$route.params.address")]
        | &nbsp;joined <b>{{ nfts.length }} communities{{ nfts.length === 1 ? '' : 's' }}</b>

    section.px-2
      ul.flex.flex-wrap.w-full_40.-mx-20
        //- nfts...
        li.px-20.w-1x2.mb-40(v-for="nft in nfts")
          user-nft(:nft="nft")

  template(v-else)
    loading-bar
</template>
