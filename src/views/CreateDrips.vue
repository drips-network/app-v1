<script setup>
import { ref, nextTick } from 'vue'
import Panel from '@/components/Panel'
import PanelDripsEdit from '@/components/PanelDripsEdit'
import PanelSplitsEdit from '@/components/PanelSplitsEdit'
import store from '@/store'

const type = ref()
const formPanel = ref()
const connectBtn = ref()

const setType = (name) => {
  type.value = name || type.value
  // scroll to panel
  nextTick().then(() => formPanel.value.scrollIntoView({ behavior: 'smooth' }))
}

const connect = async () => {
  try {
    await store.dispatch('connect')
    setType()
  } catch (e) {
    console.error(e)
  }
}
</script>

<template lang="pug">
panel.mx-auto(icon="💧")
  template(v-slot:header)
    h1.text-violet-650ff Drip to Others

  template(v-slot:description)
    p.text-violet-650.mx-auto(style="max-width:25em")
      | Choose #[span.font-bold how] you would like to drip to others.
      //- <br>
      //- | Your drips will appear on your #[span.font-bold profile] and&nbsp;can&nbsp;be&nbsp;#[span.font-bold edited]&nbsp;later.

  //- funding options as tiles
  .flex.-mx-10.mt-40
    //- TODO convert to radio buttons for accessibility
    .w-1x2.px-10
      .aspect-w-1.aspect-h-1.relative.rounded-2xl.shadow-md-blue.border.border-transparent.notouch_hover_border-violet-500(:class="{'opacity-30': type && type !== 'drip' }")
        button.absolute.overlay.flex.items-center.justify-center(@click="setType('drip')")
          div
            div.text-2xl.mb-16 🗓
            .text-xl.font-semibold.mb-16 Monthly Amount
            p.text-violet-600.px-10.leading-tight Drip DAI on a monthly basis.<br>&nbsp;Top-up periodically.
        //- circle
        .m-20.h-32.w-32.border.border-violet-700.rounded-full.p-3.flex
          .rounded-full.w-full(:class="{'bg-violet-700': type === 'drip'}")

    .w-1x2.px-10
      .aspect-w-1.aspect-h-1.relative.rounded-2xl.shadow-md-blue.border.border-transparent.notouch_hover_border-violet-500(:class="{'opacity-30': type && type !== 'split' }")
        button.absolute.overlay.flex.items-center.justify-center(@click="setType('split')")
          div
            div.text-2xl.mb-16 💦
            .text-xl.font-semibold.mb-16 Share your Drips
            p.text-violet-600.px-10.leading-tight Share a percent of your incoming&nbsp;drips.
        //- circle
        .m-20.h-32.w-32.border.border-violet-700.rounded-full.p-3.flex
          .rounded-full.w-full(:class="{'bg-violet-700': type === 'split'}")

.flex.justify-center.items-start.pt-24.min-h-screen(v-show="type", ref="formPanel")
  //- connect btn
  template(v-if="!$store.state.address")
    panel(icon="⚡️")
      template(v-slot:header)
        h2 Connect your Wallet
      template(v-slot:description)
        p.text-violet-650 First connect your Ethereum wallet to begin configuring your drips.
      button.mt-40.btn.btn-lg.btn-violet.mx-auto.px-36(ref="connectBtn", @click.prevent="connect") Connect

  //- (edit drips)
  template(v-else-if="type === 'drip'")
    panel-drips-edit

  //- (edit splits)
  template(v-else-if="type === 'split'")
    panel-splits-edit.mx-auto

</template>
