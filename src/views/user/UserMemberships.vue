<script setup>
import { ref, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
import UserNft from '@/components/UserNFT'
import InfoBar from '@/components/InfoBar'
import Addr from '@/components/Addr'

const route = useRoute()

const nfts = ref([])

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

  info-bar.mx-40.mb-20.justify-center.px-32
    div
      template(v-if="$store.getters.isWalletAddr($route.params.address)") You are
      template(v-else) #[addr.font-bold(:address="$route.params.address")] is
      | &nbsp;a member of <b>{{ nfts.length }}</b> project{{ nfts.length === 1 ? '' : 's' }}

  template(v-if="nfts")
    ul.flex.flex-wrap.px-20.w-full
      //- nfts...
      li.px-20.w-1x2.mb-40(v-for="nft in nfts")
        user-nft(:nft="nft")

  template(v-else)
    p.px-40 Loading...
</template>
