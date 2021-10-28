<script setup>
import { ref, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import store from '@/store'
import AvatarBlockie from '@/components/AvatarBlockie'
import InputBody from '@/components/InputBody'
import Modal from '@/components/Modal'
import SvgGlobe from '@/components/SvgGlobe'
import SvgTwitter from '@/components/SvgTwitter'
import SvgGithub from '@/components/SvgGithub'
import SvgDai from '@/components/SvgDai'
import { fromWei, toDAIPerMo } from '@/utils'

const route = useRoute()

const projectAddress = route.params.address
const project = ref()
const meta = ref(null)
const nftType = ref()
const minDAI = ref()

const status = ref()
const mintModal = ref(false)

onBeforeMount(async () => {
  try {
    // get project...
    project.value = await store.dispatch('getProject', projectAddress)

    if (!project.value) {
      status.value = 'Not Found :('
      return false
    }
    // get meta...
    meta.value = await store.dispatch('getProjectMeta', { ipfsHash: project.value.ipfsHash })
    // finish setup
    nftType.value = project.value.nftTypes[0]
    minDAI.value = toDAIPerMo(nftType.value.minAmtPerSec)
  } catch (e) {
    console.error(e)
    status.value = 'Error :/'
  }
})
</script>

<template lang="pug">
article.project

  template(v-if="!meta")
    .panel-indigo.my-10.py-12.px-10(:class="{'animate-pulse': !status}")
      .h-80.rounded-full.bg-indigo-800.px-28.flex.items-center.text-md.font-medium
        | {{ status }}
      .h-160
      .h-160

  template(v-else)
    section.panel-indigo.my-10.py-12.pb-48
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
                      svg-dai.mr-3(size="lgg")
                      .flex.items-end.leading-none
                        | {{ membership.minDAI }}
                        span.tracking-tight.text-sm.ml-2.font-semibold /MO
                  ul.mt-32.list-disc.pl-18
                    li(v-for="perk in membership.perks") {{ perk }}
                .flex.justify-center
                  //- TODO: join click
                  button.border.border-white.rounded-full.h-48.flex.items-center.justify-center.text-md.min-w-132.notouch_hover_bg-white.notouch_hover_text-violet-800.transition.duration-100(disabled) Join

      modal(v-if="nftType", :open="mintModal", @close="mintModal = false", :projectAddress="projectAddress", :nftType="nftType")
</template>
