<script setup>
// TODO - consider making this one reactive body rather than break into components with emits...
// manage open/close panels here and wrap the form inputs of this component...

// TODO - auto-update when re-editing areas? Or change button to "SAVE" in each panel??

import { ref, computed, toRaw, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Panel from '@/components/Panel'
import InputBody from '@/components/InputBody'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle'
import store from '@/store'
import { toWei, toWeiPerSec, formatSplits } from '@/utils'
import FieldsProjectEdit from '@/components/FieldsProjectEdit'
import SvgX from '@/components/SvgX'
import { constants } from 'ethers'
import showdown from 'showdown'
const route = useRoute()
const router = useRouter()

const step = ref(0)
const review = ref(false)
const tx = ref()
const owner = computed(() => store.state.address)
const projectAddress = ref(null)

// nft types
const isSubscription = ref(true)
const minDAIPerMonth = ref() // subscription
const minDAIPrice = ref() // onetime
const tokenLimit = ref()
const tokenLimitCeiling = '1000000000000' // constants.MaxUint256.toString() -> gives error
const nftImageIpfsHash = ref('')

const nftType = computed(() => {
  const minWei = isSubscription.value ? toWeiPerSec(minDAIPerMonth.value).toString()
    : toWei(minDAIPrice.value)
  const limit = isSubscription.value ? tokenLimitCeiling : tokenLimit.value
  return [
    0, // typeId: preset first type as 0
    limit, // 1000000000, // limit: preset to 1 billion for now... change to ethers.constants.MaxUint256.toString() ?
    minWei, // minAmtPerSec
    isSubscription.value, // is streaming token (vs one-time payment)
    nftImageIpfsHash.value || '' // ipfsHash for custom nft image
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
const dripsFormatted = computed(() => formatSplits(drips.value))

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
  memberships: [], // [newMembershipTempl()],
  benefits: ''
})

// benefits
const benefitsInputMd = ref('')
const converter = new showdown.Converter()
const benefitsInputHtml = computed(() => converter.makeHtml(benefitsInputMd.value))
const benefitsInputHidden = ref(false)

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
const removeDrip = (i) => drips.value.splice(i, 1)

// panels
const projectPanel = ref()
const fundingPanel = ref()
const membershipsPanel = ref()
const benefitsPanel = ref()
const dripsPanel = ref()

const openFundingPanel = async () => {
  // projectPanel.value.close()
  // window.scroll({ top: 0, behavior: 'smooth' })
  step.value++
  await nextTick()
  fundingPanel.value.$el.scrollIntoView({ behavior: 'smooth' })
}

const openMembershipsPanel = () => {
  // projectPanel.value.close()
  // fundingPanel.value.close()
  window.scroll({ top: 0, behavior: 'smooth' })
  step.value++
}

const openBenefitsPanel = async () => {
  step.value++
  await nextTick()
  benefitsPanel.value.$el.scrollIntoView({ behavior: 'smooth' })
}

const openDripsPanel = async () => {
  // validate memberships
  meta.value.memberships = meta.value.memberships.filter(m => m.name.length && m.minDAI > 0)
  //
  // projectPanel.value.close()
  // fundingPanel.value.close()
  // membershipsPanel.value.close()
  // window.scroll({ top: 0, behavior: 'smooth' })
  step.value++
  await nextTick()
  dripsPanel.value.$el.scrollIntoView({ behavior: 'smooth' })
}

const openPanelsForReview = () => {
  // validate drips (remove empty)
  drips.value = drips.value.filter(drip => drip.address.length && drip.percent > 0)
  //
  // projectPanel.value.open()
  // fundingPanel.value.open()
  // membershipsPanel.value.open()
  window.scroll({ top: 0, behavior: 'smooth' })
  step.value++
  review.value = true
  benefitsInputHidden.value = true
}

async function submitProject () {
  try {
    // TODO - better UX to break ipfs and create into separate actions with error handling inside this component
    tx.value = await store.dispatch('createProject', {
      project: toRaw(project.value),
      meta: toRaw({
        ...meta.value,
        benefits: benefitsInputHtml.value
      })
    })
    console.log('tx', tx.value)

    // on project created...
    projectAddress.value = await store.dispatch('waitForProjectCreate', tx.value)

    // go to project
    router.push({ name: 'project', params: { address: projectAddress.value.toLowerCase() } })
  } catch (e) {
    console.error(e)
    alert('Error creating project: ' + e.message)
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

  //- 1. PROJECT
  panel.mx-auto(ref="projectPanel", label="Community", icon="✨")
    template(v-slot:header)
      h2
        template(v-if="!review") Create a Community
        template(v-else) Review your Community

    template(v-if="review", v-slot:description)
      p Fields in #[span.text-red-500.font-bold red] you can't edit later!

    section
      //- (connect bt)
      template(v-if="!owner")
        button.btn.btn-lg.btn-violet.mx-auto.px-36(@click.prevent="$store.dispatch('connect')") Connect Wallet

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
    template(v-slot:description)
      p Decide on how to <b>fund your community</b>.<br>For now, you can only have <b>one membership type</b>.
      //- | <br>Fields in #[span.text-red-500.font-bold red] you cannot change later!

    //- funding options as tiles
    .flex.-mx-10.mt-40
      //- TODO convert to radio buttons for accessibility
      .w-1x2.px-10
        .aspect-w-1.aspect-h-1.relative.rounded-2xl.shadow-md-blue(:class="{'opacity-50': !isSubscription, 'border border-violet-700': isSubscription}")
          button.absolute.overlay.flex.items-center.justify-center(@click="isSubscription = true")
            div.pt-16
              .text-xl.font-semibold.mb-16 Subscriptions
              p.text-violet-600 Recurring income from<br>your community.
          //- circle
          .m-20.h-32.w-32.border.border-violet-700.rounded-full.p-3.flex
            .rounded-full.w-full(:class="{'bg-violet-700': isSubscription}")

      .w-1x2.px-10
        .aspect-w-1.aspect-h-1.relative.rounded-2xl.shadow-md-blue(:class="{'opacity-50': isSubscription, 'border border-violet-700': !isSubscription}")
          button.absolute.overlay.flex.items-center.justify-center(@click="isSubscription = false")
            div.pt-16
              .text-xl.font-semibold.mb-16 One-time Payment
              p.text-violet-600 Create a limited edition membership.
          //- circle
          .m-20.h-32.w-32.border.border-violet-700.rounded-full.p-3.flex
            .rounded-full.w-full(:class="{'bg-violet-700': !isSubscription}")

    form.mt-40(@submit.prevent="openBenefitsPanel", validate)
      //- (input monthly rate)
      template(v-if="isSubscription")
        input-body.my-10.text-red-600(label="Minimum Subscription", symbol="daipermo")
          input(v-model="minDAIPerMonth", type="number", placeholder="10", required)

      //- (one-time payment inputs)
      template(v-else)
        //- min price
        input-body.my-10.text-red-600(label="Minimum Price*", symbol="dai")
          input(v-model="minDAIPrice", type="number", placeholder="100", required)
        //- token limit
        input-body.my-10.text-red-600(label="Token Limit*")
          input(v-model="tokenLimit", type="number", min="1", step="1", :max="tokenLimitCeiling" placeholder="1000", required)

      //- token symbol
      input-body.my-10.text-red-600(label="Token Symbol*")
        input(v-model="meta.symbol", placeholder="CC", required)

      //- input goal
      input-body.my-10(:label="isSubscription ? 'Monthly Funding Goal' : 'Funding Goal'", :isFilled="typeof meta.goal === 'number'", :symbol="isSubscription ? 'daipermo' : 'dai'")
        input(v-model="meta.goal", type="number", placeholder="1000")

      //- custom image ipfs hash
      input-body.my-10.text-red-600(label="Custom Token Image IPFS Hash (optional)", format="code", style="display:none")
        input(v-model="nftImageIpfsHash", placeholder="QmcjdWo3oDYPGdLCdmEpGGpFsFKbfXwCLc5kdTJj9seuLx")

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

  //- 3. BENEFITS
  panel.mx-auto.my-24(ref="benefitsPanel", v-show="step > 1", title="Benefits", icon="🧧")
    template(v-slot:header)
      h2 Benefits

    //- TODO allow ENS names...
    template(v-slot:description)
      p.mx-auto(style="max-width:26em") Describe any perks or benefits that come with membership to your community.

    input-body(label="Benefits (Markdown)", v-show="!benefitsInputHidden")
      textarea.font-mono(v-model="benefitsInputMd", placeholder="Discord access..." rows="7")

    .mt-10.min-h-80.bg-indigo-700.rounded-2xlb.relative.leading-tight(@click="benefitsInputHidden = false")
      .absolute.top-0.left-0.w-full.mt-4.text-ceter.text-mss.text-violet-650 Preview HTML
      div.px-24.pb-20.pt-28.text-left.text-xl.font-semibold.child-links-underline.pointer-events-none.child-lists-list(v-html="benefitsInputHtml")

    .mt-40.flex.justify-center(v-if="!review")
      button.btn.btn-lg.btn-violet.mx-auto.min-w-xs(@click.prevent="openDripsPanel")
        | {{ benefitsInputMd.length ? 'Next' : 'Skip' }}

  //- 4. DRIPS

  panel.mx-auto(ref="dripsPanel", v-show="step > 2", title="Drips", icon="💧")
    template(v-slot:header)
      h2 Drip to Others

    //- TODO allow ENS names...
    template(v-slot:description)
      p Share a <b>precent</b> of incoming funds with others, <br>like your contributors or dependencies.

    //- drips list
    //- form.mt-60(@submit.prevent="submit", autocomplete="off")
    section.mt-60
      //- drips...
      template(v-for="(drip, i) in drips")
        section.my-10.input-group.relative
          input-body(label="% of Revenue*", :isFilled="typeof drips[i].percent === 'number'", theme="dark")
            input(v-model="drips[i].percent", type="number", min="0.01", max="100", step="0.01", placeholder="5", required)
          //- input address
          .mt-10
            input-body(label="Ethereum/ENS Address*", :isFilled="drips[i].address === 'length'", theme="dark", format="code")
              //- TODO: validate ethereum address
              input(v-model="drips[i].address", placeholder="name.eth", autocomplete="new-password", required)
          //- rmv btn
          .absolute.top-0.right-0.h-full.flex.items-center
            button.w-32.h-32.flex.items-center.justify-center.-mr-12.bg-indigo-900.rounded-full.border-violet-700.border-2.notouch_hover_border-white(@click="removeDrip(i)")
              svg-x.h-10.w-10(strokeWidth="2" strokeCap="round")

      button.mt-10.block.w-full.rounded-full.h-80.flex.items-center.justify-center.border.border-violet-500(@click.prevent="addDrip", style="border-style:dashed")
        svg-plus-minus-radicle

      .mt-40.flex.justify-center(v-show="step === 3")
        //- .mx-5
          button.btn.btn-lg.btn-outline.mx-auto.min-w-xs(@click.prevent="emit('skip')") Skip
        //- .mx-5

        button.btn.btn-lg.btn-violet.mx-auto.min-w-xs(@click.prevent="openPanelsForReview") Review

  //- (create btn)
  .sticky.bottom-20.left-0.w-full.mt-40.flex.justify-center(v-show="step > 3")
    .text-center
      button.btn.btn-xl.btn-white.min-w-md(@click="submitProject", :disabled="tx")
        template(v-if="projectAddress") Created!
        template(v-else-if="tx") Creating...
        template(v-else) Create ✨

      //- (tx link)
      .mt-16.text-violet-600.py-8.px-16.rounded-full.bg-indigo-900(v-if="tx")
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
