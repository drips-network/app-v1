<script setup>
// TODO - consider making this one reactive body rather than break into components with emits...
// manage open/close panels here and wrap the form inputs of this component...

// TODO - auto-update when re-editing areas? Or change button to "SAVE" in each panel??

import { ref, computed, toRaw, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Panel from '@/components/Panel.vue'
import InputBody from '@/components/InputBody.vue'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle.vue'
import store, { pinJSONToIPFS } from '@/store'
import { toWei, toWeiPerSec, formatSplits, ipfsUrl, validateSplits, validateAddressInput } from '@/utils'
import FieldsProjectEdit from '@/components/FieldsProjectEdit.vue'
import SvgX from '@/components/SvgX.vue'
import { constants } from 'ethers'
import showdown from 'showdown'
import SvgPen from '@/components/SvgPen.vue'
import InputUploadFileIpfs from '@/components/InputUploadFileIpfs.vue'
import FormMessage from '@/components/FormMessage.vue'
import WarningPolygonAddresses from '@/components/WarningPolygonAddresses.vue'
import TxLink from '@/components/TxLink.vue'

const route = useRoute()
const router = useRouter()

const step = ref(0)
const review = ref(false)
const tx = ref()
const txMsg = ref()
const owner = computed(() => store.state.address)
const projectAddress = ref(null)

// nft types
const tokenType = ref(null) // user selects
const isSubscription = computed(() => tokenType.value === 'subscription')
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
// const dripsFormatted = computed(() => formatSplits(drips.value))

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

// compiled project
const project = computed(() => {
  return {
    name: meta.value.name,
    symbol: meta.value.symbol,
    inputNFTTypes: [nftType.value],
    drips: drips.value // validate during submit
  }
})

// prefill token image with avatar (if empty)
watch(meta, () => {
  if (meta.value.image && !nftImageIpfsHash.value) {
    nftImageIpfsHash.value = meta.value.image
  }
}, { deep: true })

// token image preview
const previewNftImageHash = computed(() => {
  return nftImageIpfsHash.value || import.meta.env.VITE_APP_NFT_DEFAULT_IMAGE_HASH
})

// benefits input
const benefitsInputMd = ref('')
const converter = new showdown.Converter()
const benefitsInputHtml = computed(() => converter.makeHtml(benefitsInputMd.value))
const benefitsInputHidden = ref(false)

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
  if (!meta.value.symbol.length) {
    meta.value.symbol = toRaw(meta.value.name).replaceAll(' ', '').toUpperCase()
  }
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
    // reset
    tx.value = null
    txMsg.value = null

    // prep
    const myProject = toRaw(project.value)
    const myMeta = toRaw({
      ...meta.value,
      benefits: benefitsInputHtml.value
    })

    // validate splits...
    txMsg.value = { message: 'Validating...' }
    // remove any empty rows
    myProject.drips = myProject.drips.filter(drip => drip.address?.length)
    // resolve ENS addresses...
    const splitsResolved = []
    for (var i = 0; i < myProject.drips.length; i++) {
      const drip = myProject.drips[i]
      const address = await validateAddressInput(drip.address)
      splitsResolved.push({ address, percent: drip.percent })
    }
    // format for contract method (sort addresses)
    myProject.drips = formatSplits(splitsResolved)

    // save full data to IPFS/pinata...
    txMsg.value = { message: 'Uploading metadata to IPFS...' }
    const ipfsHash = await pinJSONToIPFS(myMeta)
    console.log('project meta:', `${import.meta.env.VITE_APP_IPFS_GATEWAY}/ipfs/${ipfsHash}`)
    myProject.ipfsHash = ipfsHash

    // submit...
    txMsg.value = { message: 'Confirm the transaction in your wallet.' }
    tx.value = await store.dispatch('createProject', { project: myProject })
    console.log('tx', tx.value)

    // wait for tx...
    txMsg.value = { message: 'Waiting for transaction confirmation...' }
    projectAddress.value = (await store.dispatch('waitForProjectCreate', tx.value))

    // success!
    txMsg.value = { status: 1, message: 'Created! View your community!' }
    tx.value = null
  } catch (e) {
    console.error(e)
    // alert('Error creating project: ' + e.message)
    // TODO scroll to error?
    txMsg.value = { status: -1, message: e.message || e }
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

const connect = async () => {
  try {
    await store.dispatch('connect')
  } catch (e) {
    console.error(e)
  }
}

const isDev = import.meta.env.NODE_ENV !== 'production'
projectAddress.value = isDev ? route.query.project : null
</script>

<template lang="pug">
.create-community(:class="{'input-warnings-visible': review}")

  //- (connect panel)
  template(v-if="!$store.state.address")
    panel.mx-auto(icon="⚡️")
      template(v-slot:header)
        h2 Connect your Wallet
      template(v-slot:description)
        p.text-violet-650 First connect your Ethereum Wallet to #[b register a community].
      button.mt-40.btn.btn-lg.btn-violet.mx-auto.px-36(@click.prevent="connect") Connect

  //- (create community flow)
  template(v-else)
    //- 1. PROJECT
    panel.mx-auto(ref="projectPanel", label="Community", icon="⛲️")
      template(v-slot:header)
        h2
          template(v-if="!review") Create a Community
          template(v-else) Review your Community

      template(v-slot:description)
        template(v-if="!review")
          p.text-violet-650.mx-auto(style="max-width:23em") Register your #[span.font-bold community] and start raising funds with #[span.font-bold NFT memberships] 🧩.
        template(v-else)
          p.text-violet-650 Some fields you #[b cannot edit later].

      section
        form(@submit.prevent="openFundingPanel", validate)
          fields-project-edit(v-model="meta", :isNewProject="true")

          div.mt-40(v-show="step === 0")
            //- create btn
            button.btn.btn-lg.btn-violet.mx-auto.min-w-xs
              | Next

    //- 2. FUNDING

    panel.mx-auto.my-24(ref="fundingPanel", v-show="step > 0", label="NFT Memberships", icon="🧩")
      template(v-slot:header)
        h2 NFT Memberships

      //- TODO description/text about how some can't be edited later !!!
      //- p Now, set a monthly goal for your project and a minimum monthly amount for subscriptions.
      template(v-slot:description)
        p.text-violet-650 How do you want to <b>fund your community</b>?
        //- <br>For now, you can only have <b>one membership type</b>.
        //- | <br>Fields in #[span.text-red-500.font-bold red] you cannot change later!

      //- funding options as tiles
      .flex.-mx-10.mt-40
        //- TODO convert to radio buttons for accessibility
        .w-1x2.px-10
          .aspect-w-1.aspect-h-1.relative.rounded-2xl.shadow-md-blue.notouch_hover_ring.notouch_hover_ring-violet-650.notouch_hover_opacity-100.transition.duration-150.group(:class="{'opacity-40': tokenType === 'onetime', 'ring ring-violet-650': tokenType === 'subscription'}")
            button.absolute.overlay.flex.items-center.justify-center(@click="tokenType = 'subscription'")
              div.pt-16
                .text-xl.font-semibold.mb-16 Subscriptions
                p.text-violet-600 Recurring monthly income from<br>your community.
            //- circle
            .m-20.h-32.w-32.border.border-violet-700.rounded-full.p-3.flex
              .rounded-full.w-full.group-hover_bg-violet-650(:class="{'bg-violet-650': tokenType === 'subscription'}")

        .w-1x2.px-10
          .aspect-w-1.aspect-h-1.relative.rounded-2xl.shadow-md-blue.notouch_hover_ring.notouch_hover_ring-violet-650.notouch_hover_opacity-100.transition.duration-150.group(:class="{'opacity-40': tokenType === 'subscription', 'ring ring-violet-650': tokenType === 'onetime'}")
            button.absolute.overlay.flex.items-center.justify-center(@click="tokenType = 'onetime'")
              div.pt-16
                .text-xl.font-semibold.mb-16 One-time Fundraiser
                p.text-violet-600 Sell limited-edition memberships.<br>&nbsp;
            //- circle
            .m-20.h-32.w-32.border.border-violet-700.rounded-full.p-3.flex
              .rounded-full.w-full.group-hover_bg-violet-650(:class="{'bg-violet-650': tokenType === 'onetime'}")

      form.mt-40(v-show="tokenType", @submit.prevent="openBenefitsPanel", validate)
        //- (input monthly rate)
        template(v-if="isSubscription")
          input-body.my-10(label="Minimum Monthly Subscription*", symbol="daipermo", warning="⚠️ You cannot edit this later!")
            input(v-model="minDAIPerMonth", type="number", placeholder="10", required)

        //- (one-time payment inputs)
        template(v-else)
          //- min price
          input-body.my-10(label="Minimum Price*", symbol="dai", warning="⚠️ You cannot edit this later!")
            input(v-model="minDAIPrice", type="number", placeholder="100", required)
          //- token limit
          input-body.my-10(label="Maximum Number of Memberships*", warning="⚠️ You cannot edit this later!")
            input(v-model="tokenLimit", type="number", min="1", step="1", :max="tokenLimitCeiling" placeholder="1000", required)

        //- input goal
        input-body.my-10(:label="isSubscription ? 'Monthly Funding Goal' : 'Funding Goal'", :isFilled="typeof meta.goal === 'number'", :symbol="isSubscription ? 'daipermo' : 'dai'")
          input(v-model="meta.goal", type="number", placeholder="1000")

        //- token symbol
        input-body.my-10(label="NFT Ticker Symbol*", warning="⚠️ You cannot edit this later!")
          input(v-model="meta.symbol", placeholder="CC", required)

        //- custom image ipfs hash
        //- input-body.my-10(label="Custom Token Image IPFS Hash (optional)", format="code", warning="⚠️ You cannot edit this later!")
          input(v-model="nftImageIpfsHash", placeholder="QmcjdWo3oDYPGdLCdmEpGGpFsFKbfXwCLc5kdTJj9seuLx")

        input-body.my-10(label="NFT Image", format="code", warning="Max 500KB. ⚠️ You cannot change the image later.")
          template(v-if="previewNftImageHash")
            .py-56.px-40.w-full
              .relative
                .aspect-w-1.aspect-h-1
                  //- TODO - get contract default
                  img.absolute.overlay.object-contain.object-center(:src="ipfsUrl(previewNftImageHash)")

          //- add image btn
          label.absolute.overlay.flex.items-center.justify-center.cursor-pointer.border.border-violet-700.focus_border-violet-600.rounded-2xlb.focus_outline-none.group(tabindex="0", @keydown="e => e.keyCode === 13 && e.target.querySelector('input').click()")
            span.sr-only Token Image
            //- input(type="file", accept=".png,.jpeg,.jpg,.svg", style="display:none")
            input-upload-file-ipfs(@hash="hash => { nftImageIpfsHash = hash }", @error="meta.image = null", style="display:none")

            //- (edit icon)
            .absolute.top-0.right-0.h-80.px-24.flex.items-center(v-if="previewNftImageHash")
              svg-pen.block.h-32.text-violet-600
            //- (plus icon)
            //- .absolute.overlay.flex.items-center.justify-center(v-else)
              svg-plus-minus-radicle.block.transform.scale-80

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
        p.text-violet-650.mx-auto(style="max-width:26em") Describe any perks or benefits that come with membership to your community.

      input-body(label="Benefits (Markdown)", v-show="!benefitsInputHidden")
        textarea.font-mono.text-left(v-model="benefitsInputMd", placeholder="Discord access..." rows="7")

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
        p.text-violet-650 Split a <b>percent</b> of incoming funds with others, <br>like your contributors or dependencies.

      //- drips list
      //- form.mt-60(@submit.prevent="submit", autocomplete="off")
      section.mt-60
        //- drips...
        template(v-for="(drip, i) in drips")
          section.my-10.input-group.relative
            input-body(:label="$store.getters.label('inputAddressLabel')", :isFilled="drips[i].address === 'length'", theme="dark", format="code")
              //- TODO: validate ethereum address
              input(v-model="drips[i].address", :placeholder="$store.getters.label('inputAddressPlaceholder')", autocomplete="new-password", required)

            input-body.mt-10(label="Percent*", :isFilled="typeof drips[i].percent === 'number'", theme="dark")
              input(v-model="drips[i].percent", type="number", min="0.01", max="100", step="0.01", placeholder="5", required)

            //- rmv btn
            .absolute.top-0.right-0.h-full.flex.items-center
              button.w-32.h-32.flex.items-center.justify-center.-mr-12.bg-indigo-900.rounded-full.border-violet-700.border-2.notouch_hover_border-white(@click="removeDrip(i)")
                svg-x.h-10.w-10(strokeWidth="2" strokeCap="round")

        button.mt-10.block.w-full.rounded-full.h-80.flex.items-center.justify-center.border.border-violet-500(@click.prevent="addDrip", style="border-style:dashed")
          svg-plus-minus-radicle

        //- (polygon address warning)
        template(v-if="$store.getters.isPolygon && drips.find(d => d.address && d.address.trim().length)")
          warning-polygon-addresses.my-40

        .mt-40.flex.justify-center(v-show="step === 3")
          //- .mx-5
            button.btn.btn-lg.btn-outline.mx-auto.min-w-xs(@click.prevent="emit('skip')") Skip
          //- .mx-5

          button.btn.btn-lg.btn-violet.mx-auto.min-w-xs(@click.prevent="openPanelsForReview") Review

    //- (tx message)
    form-message.my-40(v-if="txMsg", :body="txMsg")

    //- (confirm btn)
    .stickyff.z-20.bottom-20.left-0.w-full.mt-40.flex.justify-center(v-show="step > 3")
      .text-center
        //- (view link)
        template(v-if="projectAddress")
          router-link.btn.btn-xl.btn-violet.px-48(:to="{name: 'project', params: { address: projectAddress }}")
            | View Community

        //- (create btn)
        template(v-else)
          button.btn.btn-xl.btn-white.px-48(@click="submitProject", :disabled="tx")
            //- template(v-if="projectAddress") Created!
            template(v-if="tx") Creating...
            template(v-else) Create

    //- (tx link)
    tx-link.w-full(v-if="tx", :tx="tx")

</template>

<style>
</style>
