<script setup>
import { ref } from 'vue'
import Panel from '@/components/Panel'
import PanelDripsEdit from '@/components/PanelDripsEdit'

const type = ref()
</script>

<template lang="pug">
section.py-60

  panel.mx-auto(icon="💧")
    template(v-slot:header)
      h1.text-violet-650ff Drip to Anyone

    template(v-slot:description)
      p.text-violet-650.mx-auto(style="max-width:25em") Choose #[span.font-bold how] you would like to drip to others.<br>Your drips will appear on your #[span.font-bold profile] and&nbsp;can&nbsp;be&nbsp;#[span.font-bold edited]&nbsp;later.

    //- funding options as tiles
    .flex.-mx-10.mt-40
      //- TODO convert to radio buttons for accessibility
      .w-1x2.px-10
        .aspect-w-1.aspect-h-1.relative.rounded-2xl.shadow-md-blue.border.border-transparent.notouch_hover_border-violet-500(:class="{'opacity-30': type && type !== 'drip' }")
          button.absolute.overlay.flex.items-center.justify-center(@click="type = 'drip'")
            div
              .text-xl.font-semibold.mb-16 Monthly Amount
              p.text-violet-600.px-10.leading-tight Drip DAI on a monthly basis.<br>&nbsp;Top-up periodically.
          //- circle
          .m-20.h-32.w-32.border.border-violet-700.rounded-full.p-3.flex
            .rounded-full.w-full(:class="{'bg-violet-700': type === 'drip'}")

      .w-1x2.px-10
        .aspect-w-1.aspect-h-1.relative.rounded-2xl.shadow-md-blue.border.border-transparent.notouch_hover_border-violet-500(:class="{'opacity-30': type && type !== 'split' }")
          button.absolute.overlay.flex.items-center.justify-center(@click="type = 'split'")
            div
              .text-xl.font-semibold.mb-16 Percent %
              p.text-violet-600.px-10.leading-tight Share a percent of your incoming&nbsp;drips.
          //- circle
          .m-20.h-32.w-32.border.border-violet-700.rounded-full.p-3.flex
            .rounded-full.w-full(:class="{'bg-violet-700': type === 'split'}")

    //- (connect wallet)
    template(v-if="type && !$store.state.address")
      .mt-40.flex.justify-center
        button.btn.btn-lg.btn-violet.mx-auto.px-36(@click.prevent="$store.dispatch('connect')") Connect Wallet

  //- edit drips
  template(v-if="type === 'drip' && $store.state.address")
    panel-drips-edit.mt-40

  //- panel.mx-auto.my-24(icon="💧")

//- section.flex.w-full.items-center.justify-center
  .flex.flex-col.items-center
      div
        router-link.btn.btn-xl.btn-indigo.px-48(:to="{name: 'create-community' }") Create a Community ✨
      div.mt-10
        button.btn.btn-xl.btn-indigo.px-56(@click="onDripBtnClick") Drip funds 💧
</template>
