<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import store from '@/store'
import Addr from '@/components/Addr'

const props = defineProps({
  drips: Array
})

// TODO remove demo
const myDrips = ref(props.drips)

// TODO remove demo
if (!myDrips.value.length) {
  myDrips.value = Array(16).fill(0).map(() => ({ address: '0x87f3834fd4fce5781b4c12500de8b90b73342861', percent: 12 }))
}
</script>

<template lang="pug">
section.project-drips.relative
  header.absolute.top-32.left-60
    .relative
      //- drip svg
      <svg width="53" height="105" viewBox="0 0 53 105" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M26.703 1.4375C26.1883 10.7016 21.6907 31.2553 14.0312 46.2484C11.9986 50.2272 10.1248 53.5804 8.46873 56.5441C3.88435 64.7481 0.968262 69.9667 0.968262 77.2053C0.968262 89.5222 11.3443 103.613 26.703 103.613V1.4375ZM26.703 1.4375C27.2177 10.7016 31.7153 31.2553 39.3748 46.2484C41.4074 50.2272 43.2812 53.5804 44.9373 56.5441C49.5217 64.7481 52.4377 69.9667 52.4377 77.2053C52.4377 89.5222 42.0617 103.613 26.703 103.613V1.4375Z" fill="#17164B"/>
      </svg>
      //- title
      h2.absolute.top-54.left-0.w-full.flex.justify-center.text-3xl.font-semibold Drips

  section
    ul.flex.flex-wrap.pl-52.pr-60
      //- TODO - mobile use :nth-child for m-l/r
      li.project-drips__drip(v-for="(drip, i) in myDrips", :class="{'ml-auto': i % 6 === 0, 'mr-auto': i % 6 === 5}")
        //- (drip head)
        .block.-mt-px.mb-32(v-if="i < 3")
          img.mx-auto(src="../assets/icons/drip-off-point.svg")
        //- drip
        router-link.block.relative.transition.duration-150.transform.notouch_hover_translate-y-20(:to="{name: 'user', params: { address: drip.address }}")
          //- drip graphic
          img.w-full.block(src="../assets/icons/drip-big.svg", alt="blue raindrop")
          //- text
          .absolute.overlay.flex.items-center.justify-center
            div.text-center
              //- percent
              .font-kaeru.text-6xl.text-violet-650.font-normal(style="margin-top:38%")
                | {{ parseInt(drip.percent) }}
                span(style="font-size: 0.75em") %
              .mt-24.text-violet-650.font-semibold.text-lg
                addr(:address="drip.address")
              //- TODO calc amount
              .mt-8.font-mono.text-ms.text-violet-650 XXX Ð/mo

</template>

<style>
.project-drips__drip{
  width: calc((292.4 + 40) / (1128.53 + 40) * 100%);
  margin-bottom:  calc(40 / (1128.53 + 40) * -100%);
  padding: 0 calc(20 / (1128.53 + 40) * 100%);
}
</style>
