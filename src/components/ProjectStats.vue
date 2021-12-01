<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import api from '@/api'
import ProjectStat from '@/components/ProjectStat'
import SvgDai from '@/components/SvgDai'
import IconSplit from '@/components/IconSplit'
import { utils } from 'ethers'

const props = defineProps({
  project: Object,
  meta: Object,
  drips: Array
})

const query = `
  query ($nftRegistryAddress: Bytes!) {
    nfts (where: {nftRegistryAddress: $nftRegistryAddress}) {
      id
      owner: nftReceiver
      tokenId
      nftTypeId
    }
  }
`

const nfts = ref(null)

onBeforeMount(async () => {
  // get nfts by project address...
  const variables = { nftRegistryAddress: props.project.id }
  const resp = await api({ query, variables })
  nfts.value = resp.data.nfts
})

const supporters = computed(() => {
  if (nfts.value) {
    // get all owners from nfts
    let supporters = nfts.value.map(nft => nft.owner)
    // dedupe
    supporters = [...new Set(supporters)]
    return supporters
  }
  return null
})

const currency = (num) => {
  num = Number(num)
  return Math.round(Number(num) / 1000)
}
</script>

<template lang="pug">
section.project-stats.flex.w-full_10.-mx-5
  //- supporters
  project-stat.flex-1.mx-5(:class="{'animate-pulse': !supporters}")
    template(v-slot:header)
      h6 🙂&nbsp; Members
    template(v-if="supporters") {{ supporters.length }}
      //- .flex.items-center
        | {{ supporters.length }}
        <span class="hiddenff ml-6 relative py-2 mt-3 -mr-6" style="font-size:0.65em;">
          span(style="filter: contrast(300%) hue-rotate(90deg)") 🙂
          .absolute.overlay.bg-violet-600(style="mix-blend-mode:darken")
        </span>
    template(v-else) ...

  //- drips from
  project-stat.flex-1.mx-5(:class="{'animate-pulse': !nfts}")
    template(v-slot:header)
      h6 🧩&nbsp; Member Tokens
    template(v-if="nfts") {{ nfts.length }}
      //- .flex.items-center
        | {{ nfts.length }}
        <span class="hiddenff ml-6 relative py-2 mt-3" style="font-size:0.75em">
          span(style="filterff: grayscale(100%)") 💧
          .absolute.overlay.bg-violet-600(style="mix-blend-mode:darken")
        </span>
    template(v-else) ...

  //- Goal
  project-stat.flex-1.mx-5(:class="{'animate-pulse': !props.meta}")
    //- TODO Dai/mo vs DAI
    template(v-slot:header)
      h6 🏁&nbsp; Monthly Goal
    template(v-if="props.meta")
      .flex.items-end
        | {{ props.meta.goal ? currency(props.meta.goal) : '?' }}
        span.ml-2(style="font-size:0.75em") K
      .absolute.bottom-0.right-0.p-22
        svg-dai.h-16.text-violet-650

    template(v-else) ...

  //- Total Revenue
  project-stat.flex-1.mx-5
    template(v-slot:header)
      h6 🧮&nbsp; Total Revenue
      //- alt: 💰🥞🔋📈
    template(v-if="project")
      .flex.items-end
        | {{ currency(utils.formatEther(project.daiCollected)) }}
        span.ml-2(style="font-size:0.75em") K
      .absolute.bottom-0.right-0.p-22
        svg-dai.h-16.text-violet-650
    template(v-else) ...

  //- total revenue
  project-stat.flex-1.mx-5(:class="{'animate-pulse': !drips}")
    template(v-slot:header)
      h6 💦&nbsp; Splits
      //- h6.flex.items-center
        div
          <icon-split/>
        | Splits
    template(v-if="drips") {{ drips.length }}
    template(v-else) ...
    //- .flex.items-center 0 <span class="hiddenff ml-3" style="font-size:0.65em">💦</span>
</template>
