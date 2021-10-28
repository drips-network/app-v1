<script>
import store from '@/store'
import AvatarBlockie from '@/components/AvatarBlockie'
import InputBody from '@/components/InputBody'
import Modal from '@/components/Modal'
import SvgGlobe from '@/components/SvgGlobe'
import SvgTwitter from '@/components/SvgTwitter'
import SvgGithub from '@/components/SvgGithub'
import SvgDai from '@/components/SvgDai'
import { fromWei, toDAIPerMo } from '@/utils'
let project, meta

export default {
  name: 'Project',
  components: { AvatarBlockie, InputBody, Modal, SvgGlobe, SvgGithub, SvgTwitter, SvgDai },
  data () {
    return {
      project,
      meta,
      mintModal: false
      // nftType: null
    }
  },
  computed: {
    projectAddress () {
      return this.$route.params.address
    },
    minDAI () {
      return toDAIPerMo(this.nftType.minAmtPerSec) || 1
    },
    nftType () {
      return this.project.nftTypes[0]
    }
  },
  async beforeRouteEnter (to, from, next) {
    try {
      await getProject(to.params.address)
      next()
    } catch (e) {
      console.error(e)
      next()
    }
  },
  async created () {
    this.project = project || await getProject(this.$route.params.address)
    // meta = meta || await getMeta(this.$route.params.address)
    // this.nftType = await this.$store.dispatch('getNFTType', { projectAddress: this.projectAddress })
  }
}

const getProject = async (address) => {
  try {
    project = await store.dispatch('getProject', address)
    meta = await store.dispatch('getProjectMeta', { ipfsHash: project.ipfsHash })
  } catch (e) {
    console.error('failed to get project or meta', e)
  }
}
</script>

<template lang="pug">
article.profile
  section.panel-indigo.my-10.py-12.pb-48(v-if="project")
    //- progress bar
    .h-80.rounded-full.bg-indigo-800.mx-10

    header.text-center.relative.pt-44
      //- owner
      .absolute.top-0.left-0.p-18
        router-link.flex.items-center.notouch_hover_bg-indigo-800.p-8.rounded-full.-m-8(:to="{name: 'user', params: {address: project.projectOwner}}")
          avatar-blockie.w-36.mr-12(:address="project.projectOwner", width="36")
          .text-violet-600.font-semibold.pr-6 {{ $store.getters.addrShort(project.projectOwner) }}

      figure.h-144.w-144.bg-indigo-800.rounded-full.mb-36.mx-auto
      //- title
      h1.text-3xl.mb-36.font-semibold {{ meta.name }}
      //- descrip
      p.text-lg {{ meta.descrip }}
      //- links
      ul.flex.justify-center
        li.mt-32.mx-8(v-if="meta.website")
          a(:href="meta.website", target="_blank", rel="noopener noreferrer")
            svg-globe.block
        li.mt-32.mx-8(v-if="meta.githubProject")
          a(:href="meta.githubProject", target="_blank", rel="noopener noreferrer")
            svg-github.block
        li.mt-32.mx-8(v-if="meta.twitter")
          a(:href="`https://twitter.com/${meta.twitter}`", target="_blank", rel="noopener noreferrer")
            svg-twitter.block

      .mt-44
        button.btn.btn-xl.btn-white.w-full.mx-auto(@click="mintModal = !mintModal", :disabled="!nftType") Fund 🌈

        .mt-16.text-violet-600(v-if="nftType") Min. {{ minDAI }} DAI/mo
      //- p
        a(:href="`https://rinkeby.etherscan.io/address/${this.projectAddress}`", target="blank") Etherscan ↗

    //- memberships
    section.mt-112(v-if="meta.memberships && meta.memberships.length")
      ul.flex.justify-center
        //- memberships...
        li.w-1x4.mx-5(v-for="membership in meta.memberships")
          .aspect-w-3.aspect-h-4.rounded-xl.relative.bg-violet-800
            .absolute.overlay.px-32.pt-36.pb-24.flex.flex-col.justify-between
              header
                .flex.justify-between.text-xl.font-semibold
                  h6.capitalize {{ membership.name }}
                  div.flex.items-center
                    svg-dai(size="lgg")
                    | {{ membership.minDAI }}
                    //- span.tracking-tight.text-ms.font-normal / MO
                ul.mt-32.list-disc.pl-16
                  li(v-for="perk in membership.perks") {{ perk }}
              .flex.justify-center
                //- TODO: join click
                button.border.border-white.rounded-full.h-48.flex.items-center.justify-center.text-md.min-w-132 Join

    modal(v-if="nftType", :open="mintModal", @close="mintModal = false", :projectAddress="projectAddress", :nftType="nftType")
</template>
