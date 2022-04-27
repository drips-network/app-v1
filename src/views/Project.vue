<script setup>
import { ref, computed, onBeforeMount, provide } from 'vue'
import { useRoute } from 'vue-router'
import store from '@/store'
import UserAvatar from '@/components/UserAvatar.vue'
import InputBody from '@/components/InputBody.vue'
import ModalMint from '@/components/ModalMint.vue'
import ModalCollectDrips from '@/components/ModalCollectDrips.vue'
import ModalSplitsEdit from '@/components/ModalSplitsEdit.vue'
import ModalEditProjectInfo from '@/components/ModalEditProjectInfo.vue'
import SvgGlobe from '@/components/SvgGlobe.vue'
import SvgTwitter from '@/components/SvgTwitter.vue'
import SvgGithub from '@/components/SvgGithub.vue'
import SvgDiscord from '@/components/SvgDiscord.vue'
import SvgDai from '@/components/SvgDai.vue'
import ProjectSplits from '@/components/ProjectSplits.vue'
import ProjectProgressBar from '@/components/ProjectProgressBar.vue'
import ProjectStats from '@/components/ProjectStats.vue'
import Addr from '@/components/Addr.vue'
import SvgPen from '@/components/SvgPen.vue'
import SvgXCircle from '@/components/SvgXCircle.vue'
import { fromWei, toDAI, toDAIPerMo, ipfsUrl, oneMonth } from '@/utils'

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
const edit = ref()

const canEdit = computed(() => project.value?.projectOwner === store.state.address)
const editMenuOpen = ref(false)
const collectModalOpen = ref(false)

const getProjectMeta = async (ipfsHash) => {
  meta.value = await store.dispatch('getProjectMeta', { ipfsHash })
}

const getDrips = () => {
  store.dispatch('getSplitsBySender', projectAddress)
    .then(splits => { drips.value = splits })
    .catch(console.error)
}

let projectRequests = 0
const getProject = async (showLoading) => {
  try {
    if (showLoading) {
      status.value = 'Loading...'
    }

    // get project...
    project.value = await store.dispatch('getProject', projectAddress)

    // !! not found
    if (!project.value) {
      status.value = "Community doesn't exist :/"
      return false
    }

    // get meta...
    await getProjectMeta(project.value.ipfsHash)

    // !! no info
    if (!meta.value) {
      status.value = 'Community info missing :/'
      return false
    }

    // get drips
    getDrips()

    // missing info?
    if (!project.value.projectOwner) {
      // project likely just created and not in API yet
      // retry every 1s with max 5 tries

      if (projectRequests < 22) {
        console.log('project not found in API yet, refetching in 1s...')
        projectRequests++
        return setTimeout(() => getProject(), 1000)
      }

      throw new Error("Couldn't fetch community info. Refresh if recently created.")
    }

    // set nft
    tokenType.value = project.value.tokenTypes[0]
    // set min
    minDAI.value = tokenType.value.streaming ? toDAIPerMo(tokenType.value.minAmt)
      : Number(toDAI(tokenType.value.minAmt), 'exact').toFixed(0)

    // get funding once tokenType is known
    // getCurrentFunding()

    status.value = null
  } catch (e) {
    // console.error(e)
    status.value = e.message || 'Error'
  }
}

const onMintModalClose = () => {
  mintModal.value = false
  getProject() // fetch in case new mints
}

const dripsList = ref()
const scrollToDripsList = () => {
  dripsList.value.$el.scrollIntoView({ behavior: 'smooth' })
}

// current funding
const currentFundingWei = computed(() => {
  // based on first token (for now)
  if (tokenType.value) {
    return tokenType.value.streaming ? tokenType.value.currentTotalAmtPerSec : tokenType.value.currentTotalGiven
  }
  return undefined
})

onBeforeMount(() => getProject(true))

provide('projectMeta', meta)
</script>

<template lang="pug">
article.project.pb-96

  //- (loading/status...)
  template(v-if="status")
    .panel-indigo.my-10.py-12.px-10.text-violet-650(:class="{'animate-pulse': status.includes('...') }")
      .h-80.rounded-full.bg-indigo-800.px-36.flex.items-center.text-md.font-medium
        | {{ status }}
      .h-160
      .h-160

  //-
  template(v-else)
    //- main project panel
    section.panel-indigo.mt-10.py-12.pb-48
      //- progress bar
      project-progress-bar.mx-10.mb-10.bg-indigo-800(v-if="project && meta && meta.goal", :meta="meta", :project="project", :currentFundingWei="currentFundingWei")

      //- header
      header.text-center.relative.pt-44
        //- owner
        .absolute.top-0.left-0.w-full.flex.justify-between
          //- left side
          div.pl-12
            //- profile link
            router-link.flex.items-center.bg-indigo-800.p-8.rounded-full.notouch_hover_ring(:to="{name: 'user', params: {address: project.projectOwner}}")
              //- avatar
              user-avatar.w-36.h-36.mr-12(:address="project.projectOwner", blockieSize="36")
              .text-violet-600.font-semibold.pr-6
                addr(:address="project.projectOwner", :youOn="true")
          //- right side
          //- template(v-if="canEdit")
            .pr-16
              button.btn.btn-md.btn-violet.text-md.px-28.notouch_hover_ring.font-semibold(@click="collectModalOpen = true")
                | Collect

        //- project image
        figure.h-144.w-144.mb-40.bg-indigo-800.rounded-full.mx-auto.relative.overflow-hidden
          img.absolute.overlay.object-cover.object-center(v-if="meta.image", :src="ipfsUrl(meta.image)")
          img.absolute.overlay.object-cover.object-center(v-else, src="~@/assets/project-avatar-default.png")
        //- title
        h1.text-3xl.mb-40.font-semibold {{ meta.name }}
        //- descrip
        p.text-lg.mx-auto.font-semibold(style="max-width:34em") {{ meta.descrip }}
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
        project-stats(v-if="project", :project="project", :meta="meta", :drips="drips", :currentFundingWei="currentFundingWei", :tallyTokens="true")

      nav.flex.justify-center.w-full
        .h-80.rounded-full.flex.items-center.px-16.bg-indigo-800
          button.btn.btn-active-violet.btn-md.font-semibold.text-lg.px-28.mr-2(@click="view = 'benefits'", :class="{'btn-violet': view === 'benefits' }")
            | Benefits
          button.btn.btn-active-violet.btn-md.font-semibold.text-lg.px-28.mr-2(@click="view = 'proposals'", :class="{'btn-violet': view === 'proposals' }")
            | Proposals

      section.mt-24.flex.justify-center.px-10.mb-96
        //- (benefits)
        .w-full.max-w-6xl.rounded-2xlb.text-xl.text-violet-650.font-semibold.bg-indigo-800.child-links-underline.leading-snug(v-show="view === 'benefits'")
          .min-h-80.p-24.px-36.children-mt-em(v-if="meta.benefits && meta.benefits.length", v-html="meta.benefits")
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

    //- (splits list)
    template(v-if="drips")
      project-splits(ref="dripsList", :drips="drips", :canEdit="canEdit", @editSplits="edit = 'splits'")

    //- (owner actions)
    template(v-if="canEdit")
      .sticky.mt-144.w-full.bottom-20.left-0.flex.justify-center.px-12
        .flex.flex-col.items-center
          //- (options)
          .flex.flex-wrap.my-5.items-center.justify-center(v-show="editMenuOpen")
            button.mx-5.btn.btn-lg.btn-violet.shadow-md.px-32.font-semibold.tracking-wide(@click="edit = 'project'")
              | Edit Info
              span.transform.-scale-x-100.ml-12 ✏️

            //- TODO edit project splits
            button.mx-5.btn.btn-lg.btn-violet.shadow-md.px-32.font-semibold.tracking-wide(@click.prevent="edit = 'splits'") Edit Drips 💧

          //- toggle menu btn
          .my-3
            button.btn.btn-lg.shadow-md.pl-36.pr-28.font-semibold.tracking-wide(:class="{'btn-violet': !editMenuOpen, 'btn-darker': editMenuOpen}", @click="editMenuOpen = !editMenuOpen")
              //- (edit icon)
              .flex.items-center(v-show="!editMenuOpen")
                | Edit
                svg-pen.h-28.ml-12.text-white.opacity-30
              //- (close icon)
              .flex.items-center(v-show="editMenuOpen")
                | Close
                svg-x-circle.h-32.ml-12.text-white.opacity-30

    modal-mint(v-if="tokenType", :open="mintModal", @close="onMintModalClose", @minted="getProject", :projectAddress="projectAddress", :tokenType="tokenType")

    modal-edit-project-info(v-if="edit === 'project'", :open="edit === 'project'", @updated="getProjectMeta", @close="edit = editMenuOpen = false", :meta="meta", :projectAddress="projectAddress")

    modal-splits-edit(v-if="edit === 'splits'", :open="edit === 'splits'", @close="edit = editMenuOpen = false; getDrips()", :projectAddress="projectAddress", @updated="getDrips", @viewSplits="scrollToDripsList")
      template(v-slot:header)
        h6 Drip to Others
      template(v-slot:description)
        p.mx-auto(style="max-width:22em")
          | Anytime your community receive drips, they will be #[b split] with the addresses below:

    modal-collect-drips(v-if="meta && collectModalOpen", :open="collectModalOpen", @close="collectModalOpen = false", @collected="getProjectMeta", :projectAddress="projectAddress")
      template(v-slot:header) Collect drips for<br>"{{ meta.name }}"
</template>
