<script>
import AvatarBlockie from '@/components/AvatarBlockie'
import InputBody from '@/components/InputBody'
import Modal from '@/components/Modal'
let project

export default {
  name: 'Project',
  components: { AvatarBlockie, InputBody, Modal },
  data () {
    return {
      project,
      mintModal: false
    }
  },
  computed: {
    projectAddress () {
      return this.$route.params.address
    }
  },
  async beforeRouteEnter (to, from, next) {
    const resp = await fetch(`https://gateway.pinata.cloud/ipfs/${to.query.ipfs}`)
    project = await resp.json()
    next()
  }
}
</script>

<template lang="pug">
article.profile
  section.panel-indigo.my-10.py-12
    //- progress bar
    .h-80.rounded-full.bg-indigo-800.mx-10

    header.text-center.relative.pt-44
      //- owner
      .absolute.top-0.left-0.pl-16.pt-20
        router-link.flex.items-center.notouch_hover_bg-indigo-800.p-8.rounded-full.-m-8(:to="{name: 'user', params: {address: project.owner}}")
          avatar-blockie.w-36.mr-12(:address="project.owner", width="36")
          .text-violet-600.font-semibold.pr-6 {{ $store.getters.addrShort(project.owner) }}

      figure.h-144.w-144.bg-indigo-800.rounded-full.mb-36.mx-auto
      //- title
      h1.text-3xl.mb-36.font-semibold {{ project.name }}
      //- descrip
      p.text-lg {{ project.descrip }}
      //- links
      ul.flex.justify-center

      .mt-44
        //- TEMP MINT
        //- .max-w-sm.mx-auto
          input-body.my-10(label="Rate", :isFilled="mint.rate !== null")
            input(v-model="mint.rate", type="number", placeholder="Rate", required)
          input-body.my-10.mb-36(label="Pre-pay", :isFilled="mint.topUp !== null")
            input(v-model="mint.topUp", type="number", placeholder="Pre-pay", required)

        button.btn.btn-xl.btn-white.w-full.mx-auto(@click="mintModal = !mintModal") Fund 🌈
      //- p
        a(:href="`https://rinkeby.etherscan.io/address/${this.projectAddress}`", target="blank") Etherscan ↗

    modal(:open="mintModal", @close="mintModal = false", :projectAddress="projectAddress")
</template>
