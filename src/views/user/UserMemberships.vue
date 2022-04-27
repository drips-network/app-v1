<script setup>
// import { ref, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
// import api from '@/api'
import UserNft from '@/components/UserNFT.vue'
// import InfoBar from '@/components/InfoBar.vue'
import Addr from '@/components/Addr.vue'
// import LoadingBar from '@/components/LoadingBar.vue'

const route = useRoute()
const props = defineProps(['nfts'])
</script>

<template lang="pug">
section.px-20
  header.flex
    h2.mx-auto.flex.bg-indigo-950.border-violet-700.rounded-full.items-center.pl-24.pr-20.h-44.font-semiboldff.text-violet-650.text-ms
      div
        template(v-if="!props.nfts")
          | Loading...
        template(v-else) 
          | #[addr.font-bold(:address="$route.params.address")] has #[b {{ props.nfts.length }} NFT Membership{{ props.nfts.length > 1 ? 's' : ''}}] 🧩

  ul.mt-60.grid.grid-cols-2.gap-40(v-if="props.nfts && props.nfts.length")
    //- nfts...
    li.mb-ff.flex(v-for="nft in nfts")
      user-nft.w-full(:nft="nft")

//- section.user-memberships
  //- .flex.justify-center.mb-40
    .mx-auto.bg-indigo-800.rounded-2xlb.py-24.px-32.text-md.text-violet-650
      | <b>Drips</b> from <b>Memberships</b> appear here.

  template(v-if="!nfts")
    loading-bar

  template(v-else)
    info-bar.mb-24.justify-center.px-32
      div
        template(v-if="$store.getters.isWalletAddr($route.params.address)") You
        template(v-else) #[addr.font-bold(:address="$route.params.address")]
        | &nbsp;are a <b>member</b> of <b>{{ nfts.length }} communit{{ nfts.length === 1 ? 'y' : 'ies' }}</b>

    section.px-2
      ul.grid.grid-cols-2.gap-40
        //- nfts...
        li.mb-ff.flex(v-for="nft in nfts")
          user-nft.w-full(:nft="nft")

    footer(v-if="!nfts.length")
      .mt-40.flex.justify-center
        router-link.btn.btn-lg.btn-outline.pl-36.pr-28(to="/explore") Explore &nbsp;🔎

</template>
