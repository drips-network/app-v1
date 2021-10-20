<script setup>
import { ref, readonly, onBeforeMount, computed } from 'vue'
import store from '@/store'
import { utils } from 'ethers'
import { toDAIPerMo } from '@/utils'
import SvgPlusMinus from '@/components/SvgPlusMinus'
import SvgDai from '@/components/SvgDai'

const props = defineProps({
  nft: Object
})

const nft = readonly(props.nft)
const nftRate = toDAIPerMo(nft.amtPerSec)

const projectAddress = readonly(props.nft.nftRegistryAddress)
const projectMeta = ref({})

const balance = ref(0)
const balanceDAI = computed(() => Math.round(utils.formatEther(balance.value) * 1000) / 1000)

const adjust = ref(null)
const toggleAdjust = () => {
  adjust.value = adjust.value ? null : 'edit'
}

const topUpAmt = ref(0)
const topUpAmtWei = computed(() => utils.parseUnits(topUpAmt.value.toString()))
const topUpTx = ref(null)

const topUp = async () => {
  try {
    topUpTx.value = await store.dispatch('nftTopUp', {
      projectAddress: nft.nftRegistryAddress,
      tokenId: nft.id.split('x').pop(1),
      amountWei: topUpAmtWei.value.toString()
    })
  } catch (e) {
    console.error(e)
  }
}

onBeforeMount(() => {
  // get project meta
  store.dispatch('getProjectMeta', { projectAddress })
    .then(meta => { projectMeta.value = meta })
  // get nft balance
  store.dispatch('getNFTBalance', { projectAddress, tokenId: props.nft.id.split('x').pop(1) })
    .then(wei => { balance.value = wei })
})
</script>

<template lang="pug">
.user-nft.shadow-md-blue.rounded-2xl.p-32
  h6.-mt-3.text-violet-600.text-xl.font-semibold
    router-link(:to="{name: 'project', params: { address: projectAddress }}")
      | {{ projectMeta.name ? projectMeta.name : $store.getters.addrShort(projectAddress) }}

  figure.my-40
    //- filler graphic
    .rounded-2xl.border.border-indigo-700.text-violet-600.aspect-w-16.aspect-h-9.relative
      .absolute.overlay.flex.items-center.justify-center.text-center
        | NFT {{ '#' + nft.id }}<br>
        | Type {{ nft.nftTypeId.toString() }}<br>
        | {{ nftRate }} DAI/mo

  //- (owner actions)
  template(v-if="nft.nftReceiver === $store.state.address")
    //- balance/valid
    .flex.my-10.-mx-5
      .flex-1.px-5
        .font-medium.text-center.mb-12 Balance
        .h-80.rounded-full.bg-indigo-700.flex.items-center
          svg-dai.w-32.h-32.ml-16.mr-6
          .flex-1
            .text-2xl.w-full.text-center.font-semibold {{ balanceDAI }}
          button.flex-shrink-0.h-54.w-54.bg-indigo-900.flex.items-center.justify-center.rounded-full.mr-12.ml-2.transform.duration-150(@click="toggleAdjust", :class="{'rotate-45': adjust}")
            svg-plus-minus
      //- .w-1x2.px-5
        .font-medium.text-center.mb-12 Valid For
        .h-80.rounded-full.bg-indigo-700.flex.items-center
          .text-2xl.w-full.text-center.font-semibold -

    //- step 1: action option
    .flex.my-10.-mx-5(v-show="adjust === 'edit'")
      button.btn.btn-lg.btn-outline.flex-1.mx-5.font-semibold.text-xl(@click="adjust = 'add'") Add
      button.btn.btn-lg.btn-outline.flex-1.mx-5.font-semibold.text-xl(@click="adjust = 'withdraw'") Withdraw

    //- adjust: add
    form.my-10(v-if="adjust === 'add'", validate, @submit.prevent="topUp")
      .h-80.rounded-full.border.border-violet-700.focus-within_border-violet-600.flex
        .flex.items-center.w-112
          svg-dai.w-32.h-32.ml-16.mr-6
        input.flex-1.flex.items-center.text-center.font-semibold.text-2xl(v-model="topUpAmt", type="number", required)
        .flex.items-center
          button.ml-6.mr-12.h-54.w-112.rounded-full.bg-indigo-800.text-lg.font-semibold.px-32(type="submit") Add

  footer.mt-32.flex.justify-end
    a.text-violet-600(:href="`https://testnets.opensea.io/assets/${projectAddress}/${nft.id}`", target="_blank", rel="noopener noreferrer") OpenSea ↗
</template>
