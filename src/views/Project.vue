<script setup>
import { ref, computed, onBeforeMount, provide } from 'vue'
import { useRoute } from 'vue-router'
import store from '@/store'
import AvatarBlockie from '@/components/AvatarBlockie'
import InputBody from '@/components/InputBody'
import ModalMint from '@/components/ModalMint'
import ModalEditProjectInfo from '@/components/ModalEditProjectInfo'
import SvgGlobe from '@/components/SvgGlobe'
import SvgTwitter from '@/components/SvgTwitter'
import SvgGithub from '@/components/SvgGithub'
import SvgDiscord from '@/components/SvgDiscord'
import SvgDai from '@/components/SvgDai'
import ProjectSplits from '@/components/ProjectSplits'
import ProjectProgressBar from '@/components/ProjectProgressBar'
import ProjectStats from '@/components/ProjectStats'
import Addr from '@/components/Addr'
import SvgPen from '@/components/SvgPen'
import SvgXCircle from '@/components/SvgXCircle'
import { fromWei, toDAI, toDAIPerMo, ipfsUrl } from '@/utils'

const route = useRoute()
const view = ref('benefits')

const projectAddress = route.params.address
const project = ref()
const meta = ref(null)
const tokenType = ref()
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

const getProject = async () => {
  try {
    // get project...
    project.value = await store.dispatch('getProject', projectAddress)

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

    // get drips
    store.dispatch('getSplitsReceivers', projectAddress)
      .then(receivers => { drips.value = receivers.percents })

    // missing project info?
    if (!project.value.projectOwner) {
      console.log('project not found in API yet, refetching...')
      // project likely just created and not in API yet (came from on-chain / partial data)
      // retry every 1s...
      return setTimeout(() => getProject(), 1000)
    }

    // set nft
    tokenType.value = project.value.tokenTypes[0]
    // set min
    minDAI.value = tokenType.value.streaming ? toDAIPerMo(tokenType.value.minAmt)
      : Number(toDAI(tokenType.value.minAmt)).toFixed(0)

    return true
  } catch (e) {
    console.error(e)
    status.value = e.message ? 'Error: ' + e.message : 'Error'
  }
}

onBeforeMount(() => getProject())

provide('projectMeta', meta)
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
      project-progress-bar.mx-10.bg-indigo-800(v-if="project && meta", :meta="meta", :project="project")

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
          img.absolute.overlay.object-cover.object-center(v-if="meta.image", :src="ipfsUrl(meta.image)")
          img.absolute.overlay.object-cover.object-center(v-else, src="~@/assets/project-avatar-default.png")
        //- title
        h1.text-3xl.mb-36.font-semibold {{ meta.name }}
        //- descrip
        p.text-lg {{ meta.descrip }}
        //- links
        ul.flex.items-center.justify-center.mt-32
          li(v-if="meta.website")
            a.block.p-6.notouch_hover_text-greenbright-500(:href="meta.website", target="_blank", rel="noopener noreferrer", title="Website")
              svg-globe.block.h-40
          li(v-if="meta.githubProject")
            a.block.p-6.notouch_hover_text-greenbright-500(:href="meta.githubProject", target="_blank", rel="noopener noreferrer", title="GitHub")
              svg-github.block.h-40
          li(v-if="meta.twitter")
            a.block.p-6.notouch_hover_text-greenbright-500(:href="`https://twitter.com/${meta.twitter}`", target="_blank", rel="noopener noreferrer", title="Twitter")
              svg-twitter.block.h-40
          li(v-if="meta.discord")
            a.block.p-6.notouch_hover_text-greenbright-500(:href="meta.discord", target="_blank", rel="noopener noreferrer", title="Discord")
              svg-discord.block.h-40

        .mt-44
          button.btn.btn-xl.btn-white.px-64.mx-auto(@click="mintModal = !mintModal", :disabled="!tokenType") Join 💧

          .mt-16.text-violet-600(v-if="tokenType") Min. {{ minDAI }} DAI/mo
        //- p
          a(:href="`https://etherscan.io/address/${this.projectAddress}`", target="blank") Etherscan ↗

      //- (stats)
      .mt-96.mb-96.px-20
        project-stats(v-if="project", :project="project", :meta="meta", :drips="drips")

      nav.flex.justify-center.w-full
        .h-80.rounded-full.flex.items-center.px-16.bg-indigo-800
          button.btn.btn-active-violet.btn-md.font-semibold.text-lg.px-28.mr-2(@click="view = 'benefits'", :class="{'btn-violet': view === 'benefits' }")
            | Benefits
          button.btn.btn-active-violet.btn-md.font-semibold.text-lg.px-28.mr-2(@click="view = 'proposals'", :class="{'btn-violet': view === 'proposals' }")
            | Proposals

      section.mt-24.flex.justify-center.px-10.mb-96
        //- (benefits)
        .w-full.max-w-6xl.rounded-2xlb.text-xl.text-violet-650.font-semibold.bg-indigo-800.child-links-underline(v-show="view === 'benefits'")
          .min-h-80.p-24.px-36(v-if="meta.benefits && meta.benefits.length", v-html="meta.benefits")
          .h-80.flex.items-center.justify-center.text-lg(v-else) ¯\_(ツ)_/¯

        //- (proposals)
        .w-full.max-w-6xl.h-80.flex.items-center.justify-center.borderff.border-violet-700.bg-indigo-800.text-violet-650.rounded-full.text-lg(v-show="view === 'proposals'")
          div #[a.font-bold(href="https://snapshot.org", target="_blank", rel="noopener noreferrer") Snapshot ] voting coming soon...

      //- (memberships)
      //- section.mt-112(v-if="meta.memberships && meta.memberships.length")
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

    //- splits list
    project-splits(v-if="drips", :drips="drips")

    //- (owner actions)
    template(v-if="canEdit")
      .sticky.mt-144.w-full.bottom-20.left-0.flex.justify-center.px-12
        .flex.flex-col.items-center
          //- (options)
          .flex.flex-wrap.my-5.items-center.justify-center(v-show="editMenuOpen")
            button.mx-5.btn.btn-lg.btn-violet.shadow-md.px-32.font-semibold.tracking-wide(@click="editProject = true")
              | Edit Info
              span.transform.-scale-x-100.ml-12 ✏️

            //- TODO edit project splits
            //- button.mx-5.btn.btn-lg.btn-violet.shadow-md.px-32.font-semibold.tracking-wide(disabled) Edit Drips 💧

          //- toggle menu btn
          .my-3
            button.btn.btn-lg.shadow-md.pl-36.pr-28.font-semibold.tracking-wide(:class="{'btn-violet': !editMenuOpen, 'btn-darker': editMenuOpen}", @click="editProject = true")
              //- , @click="editMenuOpen = !editMenuOpen")
              .flex.items-center(v-show="!editMenuOpen")
                | Edit
                svg-pen.h-28.ml-12.text-white.opacity-30
              .flex.items-center(v-show="editMenuOpen")
                | Close
                svg-x-circle.h-32.ml-12.text-white.opacity-30

    modal-mint(v-if="tokenType", :open="mintModal", @close="mintModal = false", :projectAddress="projectAddress", :tokenType="tokenType")

    modal-edit-project-info(v-if="editProject", :open="editProject", @updated="getProjectMeta", @close="editProject = editMenuOpen = false", :meta="meta", :projectAddress="projectAddress")

</template>
