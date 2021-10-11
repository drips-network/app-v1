<script>
import store from '@/store'
import AvatarBlockie from '@/components/AvatarBlockie'
import InputBody from '@/components/InputBody'
import Modal from '@/components/Modal'
let meta

export default {
  name: 'Project',
  components: { AvatarBlockie, InputBody, Modal },
  data () {
    return {
      meta,
      mintModal: false
    }
  },
  computed: {
    projectAddress () {
      return this.$route.params.address
    }
  },
  async beforeRouteEnter (to, from, next) {
    try {
      meta = await store.dispatch('getProjectMeta', to.params.address)
      next()
    } catch (e) {
      console.error(e)
    }
  }
}
</script>

<template lang="pug">
article.profile
  section.panel-indigo.my-10.py-12.pb-48
    //- progress bar
    .h-80.rounded-full.bg-indigo-800.mx-10

    header.text-center.relative.pt-44
      //- owner
      .absolute.top-0.left-0.pl-16.pt-20
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
        button.btn.btn-xl.btn-white.w-full.mx-auto(@click="mintModal = !mintModal") Fund 🌈
      //- p
        a(:href="`https://rinkeby.etherscan.io/address/${this.projectAddress}`", target="blank") Etherscan ↗

    modal(:open="mintModal", @close="mintModal = false", :projectAddress="projectAddress")
</template>
