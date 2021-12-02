<script setup>
// TODO - consider making this one reactive body rather than break into components with emits...
// manage open/close panels here and wrap the form inputs of this component...

// TODO - auto-update when re-editing areas? Or change button to "SAVE" in each panel??

import { ref, computed, toRaw, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Panel from '@/components/Panel'
import InputBody from '@/components/InputBody'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle'
import store from '@/store'
import { toWeiPerSec, formatDrips } from '@/utils'
import FieldsProjectEdit from '@/components/FieldsProjectEdit'

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
    toWeiPerSec(minDAIPerMonth.value).toString(), // minAmtPerSec
    '' // ipfsHash for custom nft image
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

const drips = ref([newDrip()])
const dripsFormatted = computed(() => formatDrips(drips.value))

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
  radicleID: '',
  githubProject: '',
  goal: undefined,
  memberships: [newMembershipTempl()]
})

// compiled project
const project = computed(() => {
  return {
    name: meta.value.name,
    symbol: meta.value.symbol,
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
  // validate memberships
  meta.value.memberships = meta.value.memberships.filter(m => m.name.length && m.minDAI > 0)
  //
  projectPanel.value.close()
  fundingPanel.value.close()
  // membershipsPanel.value.close()
  window.scroll({ top: 0, behavior: 'smooth' })
  step.value++
}

const openPanelsForReview = () => {
  // validate drips (remove empty)
  drips.value = drips.value.filter(drip => drip.address.length && drip.percent > 0)
  //
  projectPanel.value.open()
  fundingPanel.value.open()
  // membershipsPanel.value.open()
  window.scroll({ top: 0, behavior: 'smooth' })
  step.value++
}

async function submitProject () {
  try {
    // TODO - better UX to break ipfs and create into separate actions with error handling inside this component
    tx.value = await store.dispatch('createProject', {
      project: toRaw(project.value),
      meta: toRaw(meta.value)
    })
    console.log('tx', tx.value)

    // on project created...
    projectAddress.value = await store.dispatch('waitForProjectCreate', tx.value)

    // go to project
    router.push({ name: 'project', params: { address: projectAddress.value.toLowerCase() } })
  } catch (e) {
    console.error(e)
    alert('Error creating project')
    tx.value = null
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

const isDev = process.env.NODE_ENV !== 'production'
projectAddress.value = isDev ? route.query.project : null
</script>

<template lang="pug">
article.create.py-80.relative
  //- create project sections
  form(@submit.prevent="submitProject")

    //- 1. PROJECT
    panel.mx-auto(ref="projectPanel", label="Community", icon="✨")
      template(v-slot:header)
        h2 Create a Community
      section
        //- (connect bt)
        template(v-if="!owner")
          button.btn.btn-lg.btn-violet.mx-auto.px-36(@click="$store.dispatch('connect')") Connect Wallet

        //- (create form)
        template(v-else)
          form(@submit.prevent="openFundingPanel", validate)
            fields-project-edit(v-model="meta", :isNewProject="true")

            div.mt-40(v-show="step === 0")
              //- create btn
              button.btn.btn-lg.btn-violet.mx-auto.min-w-xs
                | Next

    //- 2. FUNDING

    panel.mx-auto.my-24(ref="fundingPanel", v-show="step > 0", label="Member Tokens", icon="🧩")
      template(v-slot:header)
        h2 Member Tokens

      //- TODO description/text about how some can't be edited later !!!
      //- p Now, set a monthly goal for your project and a minimum monthly amount for subscriptions.

      //- funding options as tiles
      .flex.-mx-10
        .w-1x2.px-10
          .aspect-w-1.aspect-h-1.relative.rounded-2xl.shadow-md-blue.border.border-violet-700(disabled)
            button.absolute.overlay.flex.items-center.justify-center
              div.pt-16
                .text-xl.font-semibold.mb-16 Subscriptions
                p.text-violet-600 Recurring income from<br>your community.
            //- circle
            .m-20.h-32.w-32.border.border-violet-700.rounded-full.p-3.flex
              .bg-violet-700.rounded-full.w-full

        .w-1x2.px-10
          .aspect-w-1.aspect-h-1.relative.rounded-2xl.shadow-md-blue.opacity-50
            button.absolute.overlay.flex.items-center.justify-center.cursor-not-allowed(disabled)
              div.pt-16
                .text-xl.font-semibold.mb-16 One-time Payment
                p.text-violet-600 Create a limited edition membership.
            //- circle
            .m-20.h-32.w-32.border.border-violet-700.rounded-full.p-3.flex
              .bg-violet-700.rounded-full.w-full

      form.mt-40(@submit.prevent="openDripsPanel", validate)
        //- input min rate
        input-body.my-10(label="Minimum Subscription*", :isFilled="typeof minDAIPerMonth === 'number'", symbol="daipermo")
          input(v-model="minDAIPerMonth", type="number", placeholder="10", required)

        input-body.my-10(label="Token Symbol*")
          input(v-model="project.symbol", placeholder="CC", required)

        //- input monthly goal
        input-body.my-10(label="Monthly Funding Goal", :isFilled="typeof meta.goal === 'number'", symbol="daipermo")
          input(v-model="meta.goal", type="number", placeholder="1000")

        .mt-40(v-show="step === 1")
          //- submit btn
          button.btn.btn-lg.btn-violet.mx-auto.min-w-xs
            | Next

    //- 3. MEMBERSHIPS

    //- panel.mx-auto.my-24(v-show="step > 1", ref="membershipsPanel", label="Benefits", icon="🏅")
      template(v-slot:header)
        h2 Benefits

      p Optionally, set membership levels with different benefits you will provide.

      //- form.mt-60(@submit.prevent="submit")
      section.mt-60
        //- memberships...
        template(v-for="(membership, i) in meta.memberships")
          section.my-10.input-group
            .flex.-mx-5
              .w-1x2.px-5
                input-body(label="Name", :isFilled="meta.memberships[i].name.length", theme="dark")
                  input(v-model="meta.memberships[i].name", placeholder="Bronze", autocomplete="new-password")
              .w-1x2.px-5
                input-body(label="Min DAI", :isFilled="typeof meta.memberships[i].minDAI === 'number'", theme="dark", symbol="dai")
                  input(v-model="meta.memberships[i].minDAI", type="number", min="0", placeholder="10")

            ul
              //- perks...
              li.relative.mt-10(v-for="(perk, ii) in membership.perks")
                //- benefit input
                input-body(label="Benefit", :isFilled="meta.memberships[i].perks[ii].length", theme="dark")
                  input(v-model="meta.memberships[i].perks[ii]", placeholder="Discord access", @keydown="e => onPerkInputKeydown(e, i, ii)")
                //- add perk row btn
                template(v-if="ii === membership.perks.length - 1")
                  .absolute.top-0.right-0.h-full.flex.items-center.justify-center.pr-12
                    button.bg-indigo-800.flex.items-center.justify-center.h-54.w-54.rounded-full(@click.prevent="addPerk(i)")
                      svg-plus-minus-radicle

        button.mt-10.block.w-full.rounded-full.h-80.flex.items-center.justify-center.border.border-violet-500(@click.prevent="addMembership", style="border-style:dashed")
          svg-plus-minus-radicle

        .mt-40(v-show="step === 2")
          button.btn.btn-lg.btn-violet.mx-auto.min-w-xs(@click.prevent="openDripsPanel") Next

    //- 4. DRIPS

    panel.mx-auto(v-show="step > 1", ref="dripsPanel", title="Drips", icon="💧")
      template(v-slot:header)
        h2 Drips

      //- TODO allow ENS names...
      p Share a <b>precent</b> of incoming funds others, <br>like your contributors or dependencies.

      //- drips list
      //- form.mt-60(@submit.prevent="submit", autocomplete="off")
      section.mt-60
        //- drips...
        template(v-for="(drip, i) in drips")
          section.my-10.input-group
            input-body(label="% of Revenue", :isFilled="typeof drips[i].percent === 'number'", theme="dark")
              input(v-model="drips[i].percent", type="number", min="0.01", max="100", step="0.01", placeholder="5")
            //- input address
            .mt-10
              input-body(label="Ethereum Address", :isFilled="drips[i].address === 'length'", theme="dark", format="code")
                //- TODO: validate ethereum address
                input(v-model="drips[i].address", placeholder="0x68fc...", autocomplete="new-password", @keydown="e => onDripInputKeydown(e, i)")
            //- input percent
            //- .flex.-mx-5
              //- .w-3x4.px-5
                input-body(label="Name", :isFilled="drips[i].name.length", theme="dark")
                  input(v-model="drips[i].name", placeholder="Name")
              .flex-1

        button.mt-10.block.w-full.rounded-full.h-80.flex.items-center.justify-center.border.border-violet-500(@click.prevent="addDrip", style="border-style:dashed")
          svg-plus-minus-radicle

        .mt-40.flex.justify-center(v-show="step === 2")
          //- .mx-5
            button.btn.btn-lg.btn-outline.mx-auto.min-w-xs(@click.prevent="emit('skip')") Skip
          //- .mx-5

          button.btn.btn-lg.btn-violet.mx-auto.min-w-xs(@click.prevent="openPanelsForReview") Review

    //- (create btn)
    .sticky.bottom-20.left-0.w-full.mt-40.flex.justify-center(v-show="step > 2")
      .text-center
        button.btn.btn-xl.btn-white.min-w-md(type="submit", :disabled="tx")
          template(v-if="projectAddress") Created!
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
