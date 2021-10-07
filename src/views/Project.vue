<script>
import AvatarBlockie from '@/components/AvatarBlockie'
let project

export default {
  name: 'Project',
  components: { AvatarBlockie },
  data () {
    return {
      project
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
  section.panel.my-10.py-12
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

      button.btn.btn-xl.btn-white.w-full.mx-auto.mt-44 Fund 🌈
      //- p
        a(:href="`https://rinkeby.etherscan.io/address/${this.projectAddress}`", target="blank") Etherscan ↗
</template>
