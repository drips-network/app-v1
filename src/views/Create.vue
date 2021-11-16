<script setup>
// TODO - consider making this one reactive body rather than break into components with emits...
// manage open/close panels here and wrap the form inputs of this component...

// TODO - auto-update when re-editing areas? Or change button to "SAVE" in each panel??

import { ref, computed, toRaw, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Panel from '@/components/Panel'
import InputBody from '@/components/InputBody'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle'
import store, { pinImageToIPFS } from '@/store'
import { toWeiPerSec } from '@/utils'

const route = useRoute()
const router = useRouter()

const step = ref(0)
const tx = ref()
const owner = computed(() => store.state.address)
const projectAddress = ref(null)

// nft types ("funding")
const minDAIPerMonth = ref()
const nftType = computed(() => {
  return [
    0, // typeId: preset first type as 0
    1000000000, // limit: preset to 1 billion for now...
    toWeiPerSec(minDAIPerMonth.value).toString() // minAmtPerSec
  ]
})

// memberships
const newMembershipTempl = () => ({
  name: '',
  minDAI: '',
  perks: ['']
})

// drips
const newDrip = () => ({
  // name: '',
  address: '',
  percent: null
})

const drips = ref([
  newDrip()
])

const dripsFormatted = computed(() => {
  // figure out drip fraction from sum of drips' weights
  const dripFractionMax = 1000000
  const dripsPercentSum = drips.value.reduce((acc, cur) => acc + (cur.percent || 0), 0)
  const dripFraction = parseInt(dripsPercentSum / 100 * dripFractionMax)

  // format
  const receiverWeights = drips.value.map(drip => {
    return {
      receiver: drip.address,
      // weight of this receiver against the total dripFraction amount, as integer (max 10K)
      amtPerSec: parseInt((drip.percent / 100 * dripFractionMax) / dripFraction * 1000)
    }
  })

  return {
    dripFraction,
    receiverWeights
  }
})

// project meta
const meta = ref({
  name: '',
  // owner - added in save
  symbol: '',
  descrip: '',
  image: null,
  website: '',
  twitter: '',
  discord: '',
  // radicleOrg: '', // TODO
  radicleProjectId: '',
  githubProject: '',
  goal: undefined,
  memberships: [newMembershipTempl()]
})

// compiled project
const project = computed(() => {
  return {
    ...meta,
    inputNFTTypes: [nftType.value],
    drips: dripsFormatted.value
  }
})

const addMembership = () => meta.value.memberships.push(newMembershipTempl())
const addPerk = (index) => meta.value.memberships[index].perks.push('')
const addDrip = () => drips.value.push(newDrip())

// panels
const projectPanel = ref()
const fundingPanel = ref()
const membershipsPanel = ref()

const openFundingPanel = () => {
  projectPanel.value.close()
  window.scroll({ top: 0, behavior: 'smooth' })
  step.value++
}

const openMembershipsPanel = () => {
  projectPanel.value.close()
  fundingPanel.value.close()
  window.scroll({ top: 0, behavior: 'smooth' })
  step.value++
}

const openDripsPanel = () => {
  projectPanel.value.close()
  fundingPanel.value.close()
  membershipsPanel.value.close()
  window.scroll({ top: 0, behavior: 'smooth' })
  step.value++
}

const openPanelsForReview = () => {
  // validate drips (remove empty)
  drips.value = drips.value.filter(drip => drip.address.length && drip.percent > 0)
  //
  projectPanel.value.open()
  fundingPanel.value.open()
  membershipsPanel.value.open()
  window.scroll({ top: 0, behavior: 'smooth' })
  step.value++
}

async function submitProject () {
  try {
    tx.value = await store.dispatch('createProject', project.value)
    console.log('tx', tx.value)

    // on project created...
    projectAddress.value = await store.dispatch('waitForProjectCreate', tx.value)

    // go to project
    // router.push({ name: 'project', params: { address } })
  } catch (e) {
    console.error(e)
  }
}

// const viewBtnVisible = ref(false)
// const showViewBtn = () => { viewBtnVisible.value = true }

function onPerkInputKeydown (e, i, ii) {
  const perks = meta.value.memberships[i].perks
  // delete perk row?
  if (e.code === 'Backspace' && !perks[ii].length && perks.length > 1) {
    perks.splice(ii, 1)
    // TODO: focus previous input
  }
}

function onDripInputKeydown (e, i) {
  if (e.code === 'Backspace' && !drips.value[i].address.length) {
    drips.value.splice(i, 1)
  }
}

// project image
const onImgFileChange = (e) => {
  const input = e.target
  if (input.files && input.files[0]) {
    var reader = new FileReader()
    reader.onload = async function (event) {
      meta.value.image = event.target.result

      // upload to ipfs
      // TODO: upload only on create() to save ipfs uploads...
      try {
        let resp = await pinImageToIPFS(meta.value.image)
        resp = await resp.json()
        // oops
        if (resp.error) {
          throw new Error(resp.message)
        }
        // save
        project.value.image = resp.IpfsHash
      } catch (e) {
        console.error(e)
        alert('An error occured. Perhaps the image is too large (200kb max)')
        meta.value.image = null
      }
    }
    reader.readAsDataURL(input.files[0])
  }
}

const isDev = process.env.NODE_ENV !== 'production'
projectAddress.value = isDev ? route.query.project : null
</script>

<template lang="pug">
article.create.py-80.relative
  //- create project sections
  form(@submit.prevent="submitProject")

    //- 1. PROJECT

    panel.mx-auto(ref="projectPanel", label="Project", icon="✨")
      template(v-slot:header)
        h2 Project
      section
        //- (connect bt)
        template(v-if="!owner")
          button.btn.btn-lg.btn-white.mx-auto(@click="$store.dispatch('connect')") Connect Wallet

        //- (create form)
        template(v-else)
          //- avatar image upload
          .h-144.w-144.mx-auto.relative.rounded-full.overflow-hidden.bg-indigo-700.mb-36
            label.absolute.overlay.flex.items-center.justify-center.cursor-pointer(tabindex="0", title="Project Image")
              span.sr-only Project Image
              input.hidden(type="file", accept=".png,.jpeg,.jpg", @change="onImgFileChange")
              svg-plus-minus-radicle
            //- (image)
            img.absolute.overlay.object-cover.pointer-events-none(v-if="meta.image", :src="meta.image", alt="your project image")

          //- form(@submit.prevent="save", validate)
          section
            //- .my-10
              input-body(label="Owner", :isFilled="owner.length", format="code")
                input(v-model="owner", placeholder="owner", disabled)
            .my-10
              input-body(label="Name*", :isFilled="meta.name.length")
                input(v-model="meta.name", placeholder="Name*", required, autocomplete="new-password")
            .my-10
              input-body(label="Symbol*", :isFilled="meta.symbol.length")
                input(v-model="meta.symbol", placeholder="Symbol*", required)
            .my-10
              input-body(label="Description", :isFilled="meta.descrip.length")
                input(v-model="meta.descrip", placeholder="Description")
            .my-10
              input-body(label="Website", :isFilled="meta.website.length", format="code")
                input(v-model="meta.website", placeholder="Website", type="url")

            .my-10.flex.-mx-10
              .px-5
                input-body(label="Twitter Handle", :isFilled="meta.twitter.length")
                  input(v-model="meta.twitter", placeholder="Twitter")
              .px-5
                input-body(label="Discord", :isFilled="meta.discord.length")
                  input(v-model="meta.discord", placeholder="Discord")

            .my-10
              input-body(label="Radicle Project ID", :isFilled="meta.radicleProjectId.length", format="code")
                input(v-model="meta.radicleProjectId", placeholder="Radicle Project ID")

            .my-10
              input-body(label="Github Project URL", :isFilled="meta.githubProject.length", format="code")
                input(v-model="meta.githubProject", placeholder="Github Project URL", type="url")

            div.mt-40(v-show="step === 0")
              //- create btn
              button.btn.btn-lg.btn-indigo.mx-auto.min-w-xs(@click.prevent="openFundingPanel")
                | Next

    //- 2. FUNDING

    panel.mx-auto.my-24(ref="fundingPanel", v-show="step > 0", label="Funding", icon="🌈")
      template(v-slot:header)
        h2 Funding

      //- p Now, set a monthly goal for your project and a minimum monthly amount for subscriptions.

      //- funding options as tiles
      .flex.-mx-10
        .w-1x2.px-10
          .aspect-w-1.aspect-h-1.relative.rounded-2xl.shadow-md-blue.border.border-violet-700(disabled)
            button.absolute.overlay.flex.items-center.justify-center
              div.pt-16
                .text-xl.font-semibold.mb-16 Subscriptions
                p.text-violet-600 Recurring income from<br>your community
            //- circle
            .m-20.h-32.w-32.border.border-violet-700.rounded-full.p-3.flex
              .bg-violet-700.rounded-full.w-full

        .w-1x2.px-10
          .aspect-w-1.aspect-h-1.relative.rounded-2xl.shadow-md-blue.opacity-50
            button.absolute.overlay.flex.items-center.justify-center.cursor-not-allowed(disabled)
              div.pt-16
                .text-xl.font-semibold.mb-16 One-off Sale
                p.text-violet-600 Create a limited edition<br> of single-purchase tokens.
            //- circle
            .m-20.h-32.w-32.border.border-violet-700.rounded-full.p-3.flex
              .bg-violet-700.rounded-full.w-full

      //- form.mt-40(@submit.prevent="submit", validate)
      section.mt-40
        //- input monthly goal
        input-body.my-10(label="Monthly Goal", :isFilled="typeof meta.goal === 'number'", symbol="daipermo")
          input(v-model="meta.goal", type="number", placeholder="Monthly Goal", required)

        //- input min rate
        input-body(label="Minimum Subscription", :isFilled="typeof minDAIPerMonth === 'number'", symbol="daipermo")
          input(v-model="minDAIPerMonth", type="number", placeholder="Minimum Subscription", required)

        .mt-40(v-show="step === 1")
          //- submit btn
          button.btn.btn-lg.btn-indigo.mx-auto.min-w-xs(@click.prevent="openMembershipsPanel")
            | Next

    //- 3. MEMBERSHIPS

    panel.mx-auto.my-24(v-show="step > 1", ref="membershipsPanel", label="Memberships", icon="🏅")
      template(v-slot:header)
        h2 Memberships

      p Optionally, set membership levels with different benefits you will provide.

      //- form.mt-60(@submit.prevent="submit")
      section.mt-60
        //- memberships...
        template(v-for="(membership, i) in meta.memberships")
          section.my-10.input-group
            .flex.-mx-5
              .w-1x2.px-5
                input-body(label="Name", :isFilled="meta.memberships[i].name.length", theme="dark")
                  input(v-model="meta.memberships[i].name", placeholder="Name", autocomplete="new-password")
              .w-1x2.px-5
                input-body(label="Min DAI", :isFilled="typeof meta.memberships[i].minDAI === 'number'", theme="dark")
                  input(v-model="meta.memberships[i].minDAI", type="number", min="0", placeholder="Min DAI")

            ul
              //- perks...
              li.relative.mt-10(v-for="(perk, ii) in membership.perks")
                input-body(label="Benefit", :isFilled="meta.memberships[i].perks[ii].length", theme="dark")
                  input(v-model="meta.memberships[i].perks[ii]", placeholder="Benefit", @keydown="e => onPerkInputKeydown(e, i, ii)")
                //-
                template(v-if="ii === membership.perks.length - 1")
                  .absolute.top-0.right-0.h-full.flex.items-center.justify-center.pr-12
                    button.bg-indigo-800.flex.items-center.justify-center.h-54.w-54.rounded-full(@click.prevent="addPerk(i)")
                      svg-plus-minus-radicle

        button.mt-10.block.w-full.rounded-full.h-80.flex.items-center.justify-center.border.border-violet-500(@click.prevent="addMembership", style="border-style:dashed")
          svg-plus-minus-radicle

        .mt-40(v-show="step === 2")
          button.btn.btn-lg.btn-indigo.mx-auto.min-w-xs(@click.prevent="openDripsPanel") Next

    //- 4. DRIPS

    panel.mx-auto(v-show="step > 2", ref="dripsPanel", title="Drips", icon="💧")
      template(v-slot:header)
        h2 Drips

      p Share revenue with others with drips.<br>Add anything with an Ethereum address.

      //- drips list
      //- form.mt-60(@submit.prevent="submit", autocomplete="off")
      section.mt-60
        //- drips...
        template(v-for="(drip, i) in drips")
          section.my-10.input-group
            //- input address
            .mb-10
              input-body(label="ETH/ENS Address", :isFilled="drips[i].address === 'length'", theme="dark", format="code")
                input(v-model="drips[i].address", placeholder="ETH Address", autocomplete="new-password", @keydown="e => onDripInputKeydown(e, i)")
            //- input percent
            .flex.-mx-5
              //- .w-3x4.px-5
                input-body(label="Name", :isFilled="drips[i].name.length", theme="dark")
                  input(v-model="drips[i].name", placeholder="Name")
              .flex-1
                input-body(label="Drip Amount (%)", :isFilled="typeof drips[i].percent === 'number'", theme="dark")
                  input(v-model="drips[i].percent", type="number", min="0.01", max="100", step="0.01", placeholder="%")

        button.mt-10.block.w-full.rounded-full.h-80.flex.items-center.justify-center.border.border-violet-500(@click.prevent="addDrip", style="border-style:dashed")
          svg-plus-minus-radicle

        .mt-40.flex.justify-center(v-show="step === 3")
          //- .mx-5
            button.btn.btn-lg.btn-outline.mx-auto.min-w-xs(@click.prevent="emit('skip')") Skip
          //- .mx-5

          button.btn.btn-lg.btn-indigo.mx-auto.min-w-xs(@click.prevent="openPanelsForReview") Review

    .mt-40.flex.justify-center.w-full(v-show="step > 3")
      .text-center
        button.btn.btn-xl.btn-white.min-w-md(type="submit")
          template(v-if="tx") Creating...
          template(v-else) Create ✨

        //- (tx link)
        .mt-16.text-violet-600(v-if="tx")
          a(:href="`https://rinkeby.etherscan.io/tx/${tx.hash}`", target="_blank", rel="noopener noreferrer") View Tx on Etherscan ↗

  //- post-create
  //- section
    //- (view link)
    .mt-40.flex.justify-center(v-show="viewBtnVisible")
      router-link.btn.btn-lg.btn-white.min-w-xs(:to="{name: 'project', params: { address: projectAddress }}") View Project

  button.absolute.bottom-0.left-0.p-8.text-violet-600.text-sm(v-show="isDev", @click="$store.dispatch('getEventLog')") Log project events...
</template>

<style>
</style>
