<script setup>
import { ref, markRaw, onBeforeMount, computed } from 'vue'
import store from '@/store'
import { utils } from 'ethers'
import { toDAIPerMo, ipfsUrl } from '@/utils'
import SvgPlusMinus from '@/components/SvgPlusMinus'
import SvgDai from '@/components/SvgDai'
import TxLink from '@/components/TxLink'
// import SvgNftTest2 from '@/components/SvgNFTTest2'

// temp
const nftArtSvg = ref()

const props = defineProps({
  nft: Object
})

const nft = markRaw(props.nft)
const nftRate = toDAIPerMo(nft.amount)
const tokenId = nft.tokenId
const nftMeta = ref({})
const nftExpiryDate = ref()
const nftActiveForDays = computed(() => {
  if (!nftExpiryDate.value) return null
  const days = (nftExpiryDate.value - new Date()) / 1000 / 60 / 60 / 24
  return days // decimal
})

const projectAddress = nft.projectAddress
const projectMeta = ref({})

const precision = 100
const round = ether => Math.floor(ether * precision) / precision

const balance = ref(0)
const balanceDAI = computed(() => round(utils.formatEther(balance.value)))

const topUpAmt = ref(0)
const topUpAmtWei = computed(() => utils.parseUnits(topUpAmt.value.toString()))
const topUpTx = ref(null)

const withdrawAmt = ref(0)
const withdrawAmtWei = computed(() => utils.parseUnits(withdrawAmt.value.toString()))
const withdrawMaxWei = ref(0)
const withdrawMax = computed(() => round(utils.formatEther(withdrawMaxWei.value)))
const withdrawTx = ref(null)

const adjust = ref(null)
const toggleAdjust = () => {
  adjust.value = adjust.value ? null : 'edit'
}

const topUp = async () => {
  try {
    topUpTx.value = await store.dispatch('nftTopUp', {
      projectAddress,
      tokenId,
      amountWei: topUpAmtWei.value
    })

    await topUpTx.value.wait()
    // update ui
    getBalance()
    getActiveUntil()
    toggleAdjust()
    topUpTx.value = null
  } catch (e) {
    console.error(e)
  }
}

const showWithdrawForm = async () => {
  adjust.value = 'withdraw'
  withdrawMaxWei.value = await store.dispatch('getNFTWithdrawable', { projectAddress, tokenId })
}

const setWithdrawToMax = () => {
  withdrawAmt.value = round(utils.formatEther(withdrawMaxWei.value))
}

const withdraw = async () => {
  try {
    withdrawTx.value = await store.dispatch('nftWithdraw', {
      projectAddress,
      tokenId,
      amountWei: withdrawAmtWei.value
    })

    await withdrawTx.value.wait()
    // update ui
    getBalance()
    getActiveUntil()
    toggleAdjust()
    withdrawTx.value = null
  } catch (e) {
    console.error(e)
  }
}

const getBalance = () => {
  // get nft balance
  store.dispatch('getNFTBalance', { projectAddress, tokenId })
    .then(wei => { balance.value = wei })
}

const getActiveUntil = () => {
  store.dispatch('getNFTActiveUntil', { projectAddress, tokenId })
    .then(timeSec => {
      nftExpiryDate.value = new Date(timeSec * 1000)
    })
    .catch(console.error)
}

onBeforeMount(() => {
  // get project meta
  store.dispatch('getProjectMeta', { projectAddress })
    .then(meta => { projectMeta.value = meta })
  getBalance()

  // get nft meta
  store.dispatch('getNFTMetadata', { projectAddress, tokenId })
    .then(meta => { nftMeta.value = meta })

  // get nft active until
  getActiveUntil()

  // temp
  fetch('/art/sketching/nft-drop-ripple-shiny-1--gif.svg')
    .then(resp => resp.text())
    .then(text => { nftArtSvg.value = text })
})
</script>

<template lang="pug">
.user-nft.shadow-md-blue.rounded-2xl.p-28.flex.flex-col
  //- TODO redesign owner actions below tile(?)
  h6
    router-link.flex.items-center(:to="{name: 'project', params: { address: projectAddress }}")
      //- avatar
      .h-36.w-36.rounded-full.overflow-hidden.relative.mr-16.bg-indigo-800
        img.absolute.overlay.object-cover.object-center(v-if="projectMeta.image", :src="ipfsUrl(projectMeta.image)")
        img.absolute.overlay.object-cover.object-center(v-else, src="~@/assets/project-avatar-default.png")
      //- title
      .text-xl.font-semibold.text-violet-600.-mt-3
        | {{ projectMeta.name ? projectMeta.name : $store.getters.addrShort(projectAddress) }}

  .flex-1.mt-36
    figure.mb-32.mx-40.relative
      .aspect-w-1.aspect-h-1
        //- (custom nft image)
        template(v-if="nftMeta.image")
          img.absolute.overlay.object-contain.object-center(:src="ipfsUrl(nftMeta.image)", alt="Member Token Image")

        //- inline svg (for exteneral ipfs bg/assets)
        //- template(v-else)
          .flex.justify-center.pointer-events-none(v-html="nftArtSvg")

      //- svg-nft-test-2.max-w-full.mx-auto
      //- img.max-w-full.mx-auto(src="https://cloudflare-ipfs.com/ipfs/QmXmduqpDqS5aY1ZAf5tSig5UWL2P9Wo31QUuVTq9hJY33")

      //- filler graphic
      //- .rounded-2xl.border.border-indigo-700.text-violet-600.aspect-w-16.aspect-h-9.relative.overflow-hidden
        //- nft meta img
        img.absolute.overlay.object-contain.object-center(v-if="nftMeta.image", :src="nftMeta.image")

        //- temp img
        //- .absolute.overlay.flex.items-center.justify-center.text-center
          | {{ '#' + nft.tokenId }}<br>
          | Type {{ nft.typeId }}<br>
          | {{ nftRate }} DAI/mo

    //- (owner actions)
    template(v-if="nft.owner === $store.state.address && nft.tokenType.streaming")
      //- balance/valid
      .flex.my-10.-mx-5
        //- balance
        .flex-1.px-5
          .font-semibold.text-center.mb-12.text-violet-650 Balance
          .h-80.rounded-full.bg-indigo-700.flex.items-center
            svg-dai.w-32.h-32.ml-16.mr-6
            .flex-1
              .text-2xl.w-full.text-center.font-semibold {{ balanceDAI }}
            button.flex-shrink-0.h-54.w-54.bg-indigo-900.flex.items-center.justify-center.rounded-full.mr-12.ml-2.transform.duration-150off(@click="toggleAdjust", :class="{'rotate-45': adjust}")
              svg-plus-minus
        //- valid for
        .w-1x2.px-5(v-show="!adjust")
          .font-semibold.text-center.mb-12.text-violet-650 Membership Expires
          .h-80.rounded-full.bg-indigo-700.flex.items-center
            .text-2xl.w-full.text-center.font-semibold(:title="nftExpiryDate")
              template(v-if="nftActiveForDays === null") -
              span.text-red-500(v-else-if="nftActiveForDays < 0") INACTIVE
              span.text-red-500(v-else-if="nftActiveForDays < 1") &lt;1 day
              //- template(v-else-if="nftActiveForDays < 2") 1 day
              span(v-else, :class="{'text-red-500': nftActiveForDays < 10}")
                | {{ Math.ceil(nftActiveForDays) }} days

      //- (edit balance buttons)
      .flex.my-10.-mx-5(v-show="adjust === 'edit'")
        button.btn.btn-lg.btn-outline.flex-1.mx-5.font-semibold.text-xl(@click="adjust = 'add'") Add
        button.btn.btn-lg.btn-outline.flex-1.mx-5.font-semibold.text-xl(@click="showWithdrawForm") Withdraw

      //- (add balance)
      form.my-10(v-if="adjust === 'add'", validate, @submit.prevent="topUp")
        .h-80.rounded-full.border.border-violet-700.focus-within_border-violet-600.flex
          .flex.items-center
            svg-dai.w-32.h-32.ml-16.mr-6

          input.flex-1.flex.items-center.text-center.font-semibold.text-2xl(v-model="topUpAmt", type="number", step="0.01", required, v-autofocus)

          .w-32.mr-16.ml-6
          //- .flex.items-center
            button.ml-6.mr-12.h-54.w-112.rounded-full.bg-indigo-800.text-lg.font-semibold.px-32(type="submit") Add
        button.mt-10.btn.btn-lg.bg-violet-600.w-full.mx-auto.font-semibold.text-xl(type="submit")
          | Add

        tx-link(v-if="topUpTx", :tx="topUpTx")

      //- (withdraw balance)
      form.my-10(v-if="adjust === 'withdraw'", validate, @submit.prevent="withdraw")
        .h-80.rounded-full.border.border-violet-700.focus-within_border-violet-600.flex.items-center
          .flex.items-center
            svg-dai.w-32.h-32.ml-16.mr-18

          input.flex-1.flex.items-center.text-center.font-semibold.text-2xl(v-model="withdrawAmt", type="number", :min="1 / precision", :max="withdrawMax", :step="1 / precision", required, v-autofocus)

          .mr-24.text-violet-600.text-base.ml-12
            //- TODO: add max click
            button.py-6(@click.prevent="setWithdrawToMax") MAX

        button.mt-10.btn.btn-lg.bg-violet-600.w-full.mx-auto.font-semibold.text-xl(type="submit")
          | Withdraw

        tx-link(v-if="withdrawTx", :tx="withdrawTx")

  footer.mt-12.flex.justify-end
    a.text-violet-600(:href="`https://opensea.io/assets/${projectAddress}/${tokenId}`", target="_blank", rel="noopener noreferrer") OpenSea ↗
</template>
