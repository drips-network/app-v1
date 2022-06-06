<script setup>
import { ref, onMounted, nextTick, computed, toRaw } from 'vue'
import SvgChevronDown from '@/components/SvgChevronDown.vue'
import SvgDai from '@/components/SvgDai.vue'
import { ipfsUrl, toDAI, toDAIPerMo, socialURL } from '@/utils'
import store from '@/store'
import ProjectProgressBar from '@/components/ProjectProgressBar.vue'
import UserAvatarsRow from '@/components/UserAvatarsRow.vue'
import { BigNumber as bn } from 'ethers'
import UserTagSmall from '@/components/UserTagSmall.vue'
import DripsListExpands from '@/components/DripsListExpands.vue'
import ModalCollectDrips from '@/components/ModalCollectDrips.vue'
import ModalEditProjectInfo from '@/components/ModalEditProjectInfo.vue'
import ModalSplitsEdit from '@/components/ModalSplitsEdit.vue'
import ModalMint from '@/components/ModalMint.vue'
import SvgGlobe from '@/components/SvgGlobe.vue'
import SvgGithub from '@/components/SvgGithub.vue'
import SvgTwitter from '@/components/SvgTwitter.vue'
import SvgDiscord from '@/components/SvgDiscord.vue'

const props = defineProps(['project', 'ownerVisible'])
const emit = defineEmits(['refresh'])

// project
const meta = ref()
const isStreaming = toRaw(props.project.tokenTypes[0].streaming)
const isMyProject = computed(() => props.project.projectOwner === store.state.address)
const ipfsHash = props.project.tokenTypes[0]?.ipfsHash || import.meta.env.VITE_APP_NFT_DEFAULT_IMAGE_HASH

// ui
const benefitsEl = ref()
const benefitsLong = ref(false)
const readMore = ref(false)
const showMembers = ref(false)
const editModalOpen = ref(false)
const editSplitsModalOpen = ref(false)
const mintModalOpen = ref(false)

// min
let minAmt = toRaw(props.project.tokenTypes[0].minAmt)
minAmt = isStreaming ? toDAIPerMo(minAmt) : toDAI(minAmt)

// current funding
const currentFundingWei = isStreaming ? toRaw(props.project.tokenTypes[0].currentTotalAmtPerSec)
  : toRaw(props.project.tokenTypes[0].currentTotalGiven)

// raised (total collected + total split)
let raised
const totalCollectedWei = bn.from(props.project.daiCollected).add(props.project.daiSplit).toString() 
if (bn.from(totalCollectedWei).lt(currentFundingWei)) {
  // use current funding if greater than what's been collected
  raised = isStreaming ? toDAIPerMo(currentFundingWei) : toDAI(currentFundingWei)
} else {
  raised = toDAI(totalCollectedWei)
}

// unique members
const membersAddrs = computed(() => {
  const addrs = props.project.tokens.map(tkn => tkn.owner)
  return [...new Set(addrs)]
})

// COLLECTABLE
const collectModalOpen = ref(false)

// collectable ([dripsWei, splitsWei])
const collectableAmts = ref()

// total collectable (add drips + splits together)
const totalCollectable = computed(() => collectableAmts.value && collectableAmts.value[0].add(collectableAmts.value[1]))

// format for UI
const totalCollectableDAI = computed(() => {
  if (!collectableAmts.value) return -1
  return toDAI(totalCollectable.value)
})

const getCollectable = () => {
  store.dispatch('getCollectable', { projectAddress: props.project.id })
    .then(amounts => { collectableAmts.value = amounts })
}

const getMeta = async () => {
  try {
    meta.value = await store.dispatch('getProjectMeta', { projectAddress: props.project.id })
    await nextTick()
    benefitsLong.value = benefitsEl.value && benefitsEl.value.scrollHeight > benefitsEl.value.offsetHeight
  } catch (e) {
    console.error(e)
  }
}

const onCollected = () => {
  getMeta()
  getCollectable()
}

// SPLITS
const splitsOut = ref()
const getSplitsOut = async () => {
  try {
    const splits = await store.dispatch('getSplitsBySender', props.project.id)
    // format + save
    splitsOut.value = splits.map(split => ({
      ...split,
      receiver: [split.receiver]
    }))
  } catch (e) {
    console.error(e)
    splitsOut.value = []
  }
}

// CONTEXT MENU
const ctxMenuVisible = ref(false)
const ctxMenuBtn = ref()
const openExtraMenuItem = callback => {
  // close menu and focus back to toggle btn for accessibility
  ctxMenuBtn.value.focus()
  ctxMenuVisible.value = false
  callback()
}

onMounted(() => {
  getMeta()
  getSplitsOut()
  getCollectable()
})
</script>

<template lang="pug">
.project-detail.w-full.max-w-4xl
  //- image
  figure.mx-auto.w-7x12.relative.z-10
    .w-full.relative
      .aspect-w-1.aspect-h-1
      img.absolute.block.overlay.object-contain.object-bottom.cursor-pointer(:src="ipfsUrl(ipfsHash)", @click="mintModalOpen = true")
      //- caption
      //- figcaption.absolute.top-full.w-full.left-0.text-center.text-sm.text-violet-650.pt-5
        | Member NFT
  
  //- body
  .-mt-40.rounded-2xlb.bg-indigo-700.pt-40.pb-40.relative(@click="ctxMenuVisible = false")
    
    //- (owner link)
    template(v-if="props.ownerVisible")
      .flex.justify-center.-mt-24.relative.z-10.pointer-events-none
        router-link(:to="{name: 'user', params: { address: props.project.projectOwner }}")
          user-tag-small.bg-violet-650.shadow-xl.notouch_hover_ring.focus_ring.pointer-events-auto(:address="props.project.projectOwner")
    
    //- title
    h3.text-center.text-xll.font-semibold.mt-40.mb-36
      router-link.notouch_hover_underline(:to="{name: 'project', params: { address: props.project.id }}")
        | {{ meta && meta.name ? meta.name : props.project.name }}

    //- icons
    .flex.mx-auto.justify-center.items-center.flex-wrap.-mt-20.mb-20(v-if="meta")
      //- (website)
      template(v-if="meta.website")
        a.block.px-4.notouch_hover_text-greenbright-500(:href="meta.website", target="_blank", rel="noopener noreferrer", title="Website")
          svg-globe.block.h-28
      //- (twitter)
      template(v-if="meta.twitter")
        a.block.px-4.notouch_hover_text-greenbright-500(:href="socialURL(meta.twitter, 'https://twitter.com/')", target="_blank", rel="noopener noreferrer", title="Twitter")
          svg-twitter.block.h-28
      //- (github)
      template(v-if="meta.githubProject")
        a.block.px-4.notouch_hover_text-greenbright-500(:href="socialURL(meta.githubProject, 'https://github.com/')", target="_blank", rel="noopener noreferrer", title="GitHub")
          svg-github.block.h-28
      //- (discord)
      template(v-if="meta.discord")
        a.block.px-4.notouch_hover_text-greenbright-500(:href="socialURL(meta.discord, 'https://discord.com/')", target="_blank", rel="noopener noreferrer", title="Discord")
          svg-discord.block.h-28

    //- details
    .flex.justify-center.flex-wrap
      //- min
      .mx-4.h-64.rounded-full.bg-indigo-800.flex.items-center.justify-center.min-w-144.px-32.text-lg.text-violet-650.font-semibold
        | {{ minAmt }}
        svg-dai.ml-5(size="md")
        template(v-if="props.project.tokenTypes[0].streaming") /mo
        //- .text-lgg.tracking-tight /MO
          
      //- (join btn)
      button.mx-4.btn.btn-mdd.btn-violet.text-lg.font-semibold.min-w-144.px-32(@click="mintModalOpen = true") Join
    
    //- benefits/description
    template(v-if="meta && meta.descrip.length")
      .mt-40.px-36.text-center.font-semibold.text-md.leading-normal(ref="benefitsEl", v-html="meta.descrip", :class="{'line-clamp-4': !readMore}")
      //- readmore/less btn
      template(v-if="benefitsLong")
        .absolute.bottom-0.left-0.w-full.flex.justify-center.pb-7
          button.text-violet-650.notouch_hover_text-white(@click="readMore = !readMore")
            svg-chevron-down.w-32.h-32(:class="{'transform rotate-180': readMore}")

    //- "•••" menu
    .absolute.top-12.right-16.z-20
      //- toggle btn
      button.h-36.rounded-full.px-14.flex.items-center.text-violet-650.focus_ring.focus_outline-none(ref="ctxMenuBtn", class="hover_bg-black/20", @click.stop="ctxMenuVisible = !ctxMenuVisible") •••
      
      //- (menu panel)
      .absolute.right-0.mt-4.rounded-xl.shadow-xl.bg-indigo-900.border-2ff.border-violet-650.whitespace-nowrap.overflow-hidden(v-show="ctxMenuVisible")
        //- (edit membership btn)
        button.w-full.h-64.px-24.flex.items-center.justify-left.focus_outline-none.focus-visible_bg-violet-600.notouch_hover_bg-violet-600(v-if="isMyProject", @click="openExtraMenuItem(() => { editModalOpen = true })")
          | Edit Info

        //- (edit splits btn)
        button.w-full.h-64.px-24.flex.items-center.justify-left.focus_outline-none.focus-visible_bg-violet-600.notouch_hover_bg-violet-600(v-if="isMyProject", @click="openExtraMenuItem(() => { editSplitsModalOpen = true })")
          | Edit Drips Receivers

        //- View on Etherscan link
        router-link.w-full.h-64.px-24.flex.items-center.justify-left.focus_outline-none.focus-visible_bg-violet-600.notouch_hover_bg-violet-600(:to="{ name: 'project', params: { address: props.project.id }}")
          | View Membership Page

        //- View on Etherscan link
        a.w-full.h-64.px-24.flex.items-center.justify-left.focus_outline-none.focus-visible_bg-violet-600.notouch_hover_bg-violet-600(:href="`${$store.getters.network.explorer.domain}/address/${props.project.id}`", target="_blank", rel="noopener noreferrer")
          | View on {{ $store.getters.network.explorer.name }} ↗
        
        //- open sea link (doesn't work with just contract address... requires OS API)
        //- a.w-full.block.h-72.flex.items-center.justify-center.px-32.focus_outline-none.focus-visible_bg-violet-600(:href="`https://opensea.io/${props.project.id}`", target="_blank", rel="noopener noreferrer")
          | View on OpenSea ↗

  //- (progress bar)
  template(v-if="meta && meta.goal")
    project-progress-bar.bg-indigo-700.mt-4(:project="project", :meta="meta", :currentFundingWei="currentFundingWei")

  .text-md.font-semibold
    
    //- (members collapsed row)
    header.relative.mt-4.h-80.flex.items-center.justify-between.pl-32.rounded-full.bg-indigo-700(v-show="!showMembers")
      //- label left
      .text-violet-650.text-md.font-semibold Members

      //- count
      template(v-if="props.project.tokens.length")
        .flex.items-center
          user-avatars-row(:addresses="membersAddrs", :limit="3")
          svg-chevron-down.w-32.h-32.mr-18.ml-8.text-violet-650
      template(v-else)
        div.pr-32 0

      //- expand btn as overlay (accessibility)
      button.absolute.overlay.rounded-full.btn-focus-violet(@click.stop="showMembers = !showMembers", aria-label="View Members")

    //- (members list expanded)
    ul.flex.flex-wrap.justify-center.my-5.bg-indigo-700.rounded-2xl.relative.pb-56(v-if="showMembers")
      .w-full.flex.justify-between.h-80.items-center.font-semibold.cursor-pointer(@click.stop="showMembers = false")
        h6.ml-32.text-violet-650 Members
        .min-w-54.h-54.px-6.mr-12.flex.items-center.justify-center.rounded-full.bg-indigo-950 {{ membersAddrs.length.toLocaleString() }}

      li(v-for="token in props.project.tokens")
        router-link.btn-focus-violet.rounded-full.block.my-4.mx-3(:to="{ name: 'user', params: { address: token.owner }}")
          user-tag-small.bg-indigo-850(:address="token.owner")

      //- close button
      .absolute.bottom-0.left-0.w-full.flex.justify-center.pb-7
        button.text-violet-650.notouch_hover_text-white(@click.stop="showMembers = false", aria-label="Hide Members")
          svg-chevron-down.w-32.h-32.transform.rotate-180

    //- stats
    .grid.gap-4.mt-4
      //- raised:
      .h-80.bg-indigo-700.flex.items-center.justify-between.px-32.rounded-full
        .text-violet-650 Raised
        .flex.items-center
          | {{ raised }}
          svg-dai.ml-5(size="sm")

      //- available
      //- .h-80.bg-indigo-700.flex.items-center.justify-between.px-32.rounded-full
        .text-violet-650 Available
        div
          //- (streaming/unlimited)
          template(v-if="isStreaming")
            span(style="font-size:1.5em") ∞
          //- (no mints)
          //- template(v-else-if="!props.project.tokens.length") {{ props.project.tokenTypes[0].limit }}
          //- (>10k avail)
          template(v-else-if="props.project.tokenTypes[0].limit - props.project.tokens.length > 10000") >10K
          //- template(v-else-if="props.project.tokenTypes[0].limit <= 10000")
          template(v-else) {{ props.project.tokenTypes[0].limit - props.project.tokens.length }}/{{ props.project.tokenTypes[0].limit }}

    //- (collectable)
    template(v-if="isMyProject")
      .mt-10.p-10.bg-indigo-950.rounded-2xlb
        //- (monthly drips in)
        template(v-if="isStreaming")
          .mb-5.h-80.bg-indigo-700ff.border.border-violet-500.flex.items-center.justify-between.px-32.rounded-full
            .text-violet-650 Monthly Drips In
            .flex.items-center(:class="{'animate-pulse': !currentFundingWei }")
              template(v-if="!currentFundingWei") ...
              template(v-else)
                | {{ toDAIPerMo(currentFundingWei) }}
                svg-dai.ml-6(size="xs")
                template(v-if="isStreaming") /mo
                //- .h-80.w-full.flex.items-center.justify-between
                  .flex-1.text-xl.text-violet-650 
                  .flex.items-center.text-white
                    .text-xl(:class="{'animate-pulse': !currentFundingWei }")
                      template(v-if="!currentFundingWei") ...
                      template(v-else)
                        | {{ toDAIPerMo(currentFundingWei) }}
                      
                    svg-dai.h-20.ml-12
                    .text-lgg.tracking-tight /MO
                    //- button.ml-24.btn.btn-md.btn-violet.px-20.font-semibold.text-lg Collect

                //- .w-full.flex.items-center.justify-between
                  .flex-1.text-xl.text-violet-650 Fully Collectable
                  .flex.items-center.text-white
                    .text-xl 26 days

            //- .h-80.mt-4.px-32.rounded-full.bg-indigo-850.flex.items-center.justify-between.font-semibold

        .h-80.bg-indigo-700ff.border.border-violet-500.flex.items-center.justify-between.px-32.rounded-full
          .text-violet-650
            template(v-if="isStreaming") Collectable Today
            template(v-else) Collectable Funds
              //- svg-question-mark-encircled.ml-18

          .flex.items-center.text-white
            div(:class="{'animate-pulse': totalCollectableDAI < 0}")
              | {{ totalCollectableDAI < 0 ? '...' : totalCollectableDAI }}
            svg-dai.ml-5(size="xs")
            //- (collect btn)
            template(v-if="totalCollectable")
              button.-mr-12.ml-20.btn.btn-sm.border-2.btn-outline-violet.px-16.font-semibold.text-md.notouch_hover_ring(, @click="collectModalOpen = true", :disabled="!totalCollectable.gt(0)")
                | Collect

  //- drips list
  .w-full.relative(v-if="isMyProject || (splitsOut && splitsOut.length)")
    drips-list-expands.z-10(:address="props.project.id", :drips="splitsOut", direction="out", :canEdit="isMyProject", @editDrips="editSplitsModalOpen = true")
    //- gradient
    .absolute.top-0.left-0.w-full.h-40.bg-gradient-to-b.from-indigo-900.to-transparent.z-20

  
  //- (mint modal)
  modal-mint(v-if="meta", :open="mintModalOpen", :project="project", :meta="meta", @close="mintModalOpen = false; $emit('refresh')", @minted="$emit('refresh')")

  
  //- (ADMIN MODALS)
  template(v-if="isMyProject")
    //- (collect modal)
    modal-collect-drips(v-if="collectModalOpen && meta", :open="collectModalOpen", @close="collectModalOpen = false", :amts="collectableAmts", @collected="onCollected", :projectAddress="props.project.id")
      template(v-slot:header) Collect Drips for<br>"{{ meta.name }}"

    //- (edit project)
    modal-edit-project-info(v-if="meta && editModalOpen", :open="editModalOpen", @updated="getMeta", @close="editModalOpen = false", :meta="meta", :projectAddress="props.project.id")

    //- (splits edit)
    modal-splits-edit(v-if="editSplitsModalOpen", :open="editSplitsModalOpen", @close="editSplitsModalOpen = false; getSplitsOut()", :projectAddress="props.project.id", @updated="getSplitsOut")
      template(v-slot:header)
        h6 Edit Drips for<br>"{{ meta.name }}"
      template(v-slot:description)
        p.mx-auto(style="max-width:24em")
          | When you <b>collect funds</b> from your membership, they will be #[b split] with the addresses below:
    
</template>