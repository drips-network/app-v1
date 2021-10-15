<script>
import store from '@/store'
import AvatarBlockie from '@/components/AvatarBlockie'
import InputBody from '@/components/InputBody'
import Modal from '@/components/Modal'
import { fromWei } from '@/utils'
let meta

export default {
  name: 'Project',
  components: { AvatarBlockie, InputBody, Modal },
  data () {
    return {
      meta,
      mintModal: false,
      nftType: null
    }
  },
  computed: {
    projectAddress () {
      return this.$route.params.address
    },
    minDAI () {
      return fromWei(this.nftType.minAmtPerSec).toNumber() || 1
    }
  },
  async beforeRouteEnter (to, from, next) {
    try {
      meta = await getMeta(to.params.address)
      next()
    } catch (e) {
      console.error(e)
      next()
    }
  },
  async created () {
    meta = meta || await getMeta(this.$route.params.address)
    this.nftType = await this.$store.dispatch('getNFTType', { projectAddress: this.projectAddress })
  }
}

const getMeta = async (address) => {
  return await store.dispatch('getProjectMeta', address)
}
</script>

<template lang="pug">
article.profile
  section.panel-indigo.my-10.py-12.pb-48
    //- progress bar
    .h-80.rounded-full.bg-indigo-800.mx-10

    header.text-center.relative.pt-44
      //- owner
      .absolute.top-0.left-0.p-18
        router-link.flex.items-center.notouch_hover_bg-indigo-800.p-8.rounded-full.-m-8(:to="{name: 'user', params: {address: meta.owner}}")
          avatar-blockie.w-36.mr-12(:address="meta.owner", width="36")
          .text-violet-600.font-semibold.pr-6 {{ $store.getters.addrShort(meta.owner) }}

      figure.h-144.w-144.bg-indigo-800.rounded-full.mb-36.mx-auto
      //- title
      h1.text-3xl.mb-36.font-semibold {{ meta.name }}
      //- descrip
      p.text-lg {{ meta.descrip }}
      //- links
      ul.flex.justify-center

      .mt-44
        button.btn.btn-xl.btn-white.w-full.mx-auto(@click="mintModal = !mintModal", :disabled="!nftType") Fund 🌈

        .mt-16.text-violet-600(v-if="nftType") Min. {{ minDAI }} DAI/mo
      //- p
        a(:href="`https://rinkeby.etherscan.io/address/${this.projectAddress}`", target="blank") Etherscan ↗

    modal(v-if="nftType", :open="mintModal", @close="mintModal = false", :projectAddress="projectAddress", :nftType="nftType")
</template>
