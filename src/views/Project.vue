<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import store from '@/store'
import AvatarBlockie from '@/components/AvatarBlockie'
import InputBody from '@/components/InputBody'
import ModalFund from '@/components/ModalFund'
import ModalEditProjectInfo from '@/components/ModalEditProjectInfo'
import SvgGlobe from '@/components/SvgGlobe'
import SvgTwitter from '@/components/SvgTwitter'
import SvgGithub from '@/components/SvgGithub'
import SvgDiscord from '@/components/SvgDiscord'
import SvgDai from '@/components/SvgDai'
import ProjectDrips from '@/components/ProjectDrips'
import ProjectProgressBar from '@/components/ProjectProgressBar'
import ProjectStats from '@/components/ProjectStats'
import Addr from '@/components/Addr'
import SvgPen from '@/components/SvgPen'
import SvgXCircle from '@/components/SvgXCircle'
import { fromWei, toDAIPerMo, ipfsUrl } from '@/utils'

const route = useRoute()

const projectAddress = route.params.address
const project = ref()
const meta = ref(null)
const nftType = ref()
const minDAI = ref()
const drips = ref()

const status = ref()
const mintModal = ref(false)
const editProject = ref(false)

const canEdit = computed(() => project.value?.projectOwner === store.state.address)
const editMenuOpen = ref(false)

const getProjectMeta = async (ipfsHash) => {
  meta.value = await store.dispatch('getProjectMeta', { ipfsHash })
  // TODO handle error for updating/editing meta?
}

onBeforeMount(async () => {
  try {
    // get project...
    project.value = (await store.dispatch('getProject', projectAddress))?.data?.fundingProject

    if (!project.value) {
      status.value = 'Not Found :('
      return false
    }

    // get meta...
    await getProjectMeta(project.value.ipfsHash)

    if (!meta.value) {
      status.value = 'Info Missing :/'
      return false
    }

    // set nft
    nftType.value = project.value.nftTypes[0]
    minDAI.value = toDAIPerMo(nftType.value.minAmtPerSec)

    // get drips
    drips.value = await store.dispatch('getProjectDrips', projectAddress)
    return true
  } catch (e) {
    console.error(e)
    status.value = e.message ? 'Error: ' + e.message : 'Error'
  }
})

</script>

<template lang="pug">
article.project.pb-96

  template(v-if="!meta")
    .panel-indigo.my-10.py-12.px-10(:class="{'animate-pulse': !status}")
      .h-80.rounded-full.bg-indigo-800.px-28.flex.items-center.text-md.font-medium
        | {{ status }}
      .h-160
      .h-160

  template(v-else)
    //- main project panel
    section.panel-indigo.mt-10.py-12.pb-48
      //- progress bar
      project-progress-bar.mx-10(:meta="meta")

      header.text-center.relative.pt-44
        //- owner
        .absolute.top-0.left-0.pt-10.pl-12
          //- profile link
          router-link.flex.items-center.notouch_hover_bg-indigo-800.p-8.rounded-full(:to="{name: 'user', params: {address: project.projectOwner}}")
            //- avatar
            avatar-blockie.w-36.mr-12(:address="project.projectOwner", width="36")
            .text-violet-600.font-semibold.pr-6
              addr(:address="project.projectOwner")

        //- project image
        figure.h-144.w-144.bg-indigo-800.rounded-full.mb-36.mx-auto.relative.overflow-hidden
          img.absolute.overlay.object-cover.object-center(:src="ipfsUrl(meta.image)")
        //- title
        h1.text-3xl.mb-36.font-semibold {{ meta.name }}
        //- descrip
        p.text-lg {{ meta.descrip }}
        //- links
        ul.flex.items-center.justify-center.mt-32
          li.m-8(v-if="meta.website")
            a(:href="meta.website", target="_blank", rel="noopener noreferrer")
              svg-globe.block
          li.m-8(v-if="meta.githubProject")
            a(:href="meta.githubProject", target="_blank", rel="noopener noreferrer")
              svg-github.block
          li.m-8(v-if="meta.twitter")
            a(:href="`https://twitter.com/${meta.twitter}`", target="_blank", rel="noopener noreferrer")
              svg-twitter.block
          li.m-8(v-if="meta.discord")
            a(:href="meta.discord", target="_blank", rel="noopener noreferrer")
              svg-discord.block

        .mt-44
          button.btn.btn-xl.btn-white.w-full.mx-auto(@click="mintModal = !mintModal", :disabled="!nftType") Fund 🌈

          .mt-16.text-violet-600(v-if="nftType") Min. {{ minDAI }} DAI/mo
        //- p
          a(:href="`https://rinkeby.etherscan.io/address/${this.projectAddress}`", target="blank") Etherscan ↗

      //- (stats)
      .mt-96.mb-120.px-20
        project-stats(v-if="project", :project="project", :meta="meta", :drips="drips")

      //- (memberships)
      section.mt-112(v-if="meta.memberships && meta.memberships.length")
        ul.flex.justify-center
          //- memberships...
          li.w-1x4.mx-5(v-for="membership in meta.memberships")
            .aspect-w-3.aspect-h-4.rounded-xl.relative.bg-violet-600
              .absolute.overlay.px-32.pt-36.pb-24.flex.flex-col.justify-between
                header
                  .flex.justify-between.text-xl.font-semibold
                    h6.capitalize {{ membership.name }}
                    div.flex.items-center
                      svg-dai.mr-3(size="lgg")
                      .flex.items-end.leading-none
                        | {{ membership.minDAI }}
                        span.text-sm.ml-2.font-semibold /MO
                  ul.mt-32.list-disc.pl-18
                    li(v-for="perk in membership.perks") {{ perk }}
                .flex.justify-center
                  //- TODO: join click
                  button.border.border-white.rounded-full.h-48.flex.items-center.justify-center.text-md.min-w-132.notouch_hover_bg-white.notouch_hover_text-violet-800.transition.duration-100(disabled) Join

    //- drips list
    project-drips(v-if="drips", :drips="drips")

    //- (owner actions)
    template(v-if="canEdit")
      .sticky.mt-144.w-full.bottom-20.left-0.flex.justify-center.px-12
        .flex.flex-col.items-center
          //- (options)
          .flex.flex-wrap.my-5.items-center.justify-center(v-show="editMenuOpen")
            button.mx-5.btn.btn-lg.btn-violet.shadow-md.px-32.font-semibold.tracking-wide(@click="editProject = true")
              | Edit Info
              span.transform.-scale-x-100.ml-12 ✏️
            button.mx-5.btn.btn-lg.btn-violet.shadow-md.px-32.font-semibold.tracking-wide Edit Drips 💧
          //- toggle menu btn
          .my-3
            button.btn.btn-lg.shadow-md.pl-36.pr-28.font-semibold.tracking-wide(:class="{'btn-violet': !editMenuOpen, 'btn-darker': editMenuOpen}", @click="editMenuOpen = !editMenuOpen")
              .flex.items-center(v-show="!editMenuOpen")
                | Edit
                svg-pen.h-28.ml-12.text-white.opacity-30
              .flex.items-center(v-show="editMenuOpen")
                | Close
                svg-x-circle.h-32.ml-12.text-white.opacity-30

    modal-fund(v-if="nftType", :open="mintModal", @close="mintModal = false", :projectAddress="projectAddress", :nftType="nftType")

    modal-edit-project-info(v-if="editProject", :open="editProject", @updated="getProjectMeta", @close="editProject = editMenuOpen = false", :meta="meta", :projectAddress="projectAddress")

</template>
