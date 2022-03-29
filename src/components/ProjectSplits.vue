<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import store from '@/store'
import Addr from '@/components/Addr.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import InfoBar from '@/components/InfoBar.vue'

const props = defineProps({
  drips: Array,
  canEdit: Boolean
})

const emit = defineEmits(['editSplits'])

</script>

<template lang="pug">
section#drips.project-splits.relative.pt-0
  header.absolute.top-40.left-36
    .relative
      //- drip svg
        <svg width="53" height="105" viewBox="0 0 53 105" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M26.703 1.4375C26.1883 10.7016 21.6907 31.2553 14.0312 46.2484C11.9986 50.2272 10.1248 53.5804 8.46873 56.5441C3.88435 64.7481 0.968262 69.9667 0.968262 77.2053C0.968262 89.5222 11.3443 103.613 26.703 103.613V1.4375ZM26.703 1.4375C27.2177 10.7016 31.7153 31.2553 39.3748 46.2484C41.4074 50.2272 43.2812 53.5804 44.9373 56.5441C49.5217 64.7481 52.4377 69.9667 52.4377 77.2053C52.4377 89.5222 42.0617 103.613 26.703 103.613V1.4375Z" fill="#17164B"/>
        </svg>
      //- title
      h2.mb-6.text-3xl.font-semibold.text-violet-600.relative.z-10
        //- span.mr-12(style="font-size:1em") 💦
        | Drips
        span.ml-8(style="font-size:1em") 💧

      //- .w-1x4.mx-auto
        <svg class="w-full block" viewBox="0 0 97 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M49.8306 0.874433C49.0427 0.0483656 47.7242 0.0483664 46.9362 0.874433L31.9394 16.5964C31.6933 16.8543 31.5342 17.1465 31.4515 17.4485C29.0547 20.8311 27.646 24.9632 27.646 29.4244C27.646 40.8775 36.9306 50.1621 48.3837 50.1621C59.8368 50.1621 69.1214 40.8775 69.1214 29.4244C69.1214 24.9627 67.7124 20.8302 65.3151 17.4474C65.2323 17.1458 65.0733 16.854 64.8275 16.5964L49.8306 0.874433Z" fill="#4B4FD5"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M49.8306 0.874433C49.0427 0.0483656 47.7242 0.0483664 46.9362 0.874433L31.9394 16.5964C31.6933 16.8543 31.5342 17.1465 31.4515 17.4485C29.0547 20.8311 27.646 24.9632 27.646 29.4244C27.646 40.8775 36.9306 50.1621 48.3837 50.1621C59.8368 50.1621 69.1214 40.8775 69.1214 29.4244C69.1214 24.9627 67.7124 20.8302 65.3151 17.4474C65.2323 17.1458 65.0733 16.854 64.8275 16.5964L49.8306 0.874433Z" fill="#17164B"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M22.4849 50.4594C21.697 49.6333 20.3785 49.6333 19.5905 50.4594L4.59365 66.1813C4.34762 66.4393 4.18848 66.7315 4.10577 67.0335C1.70896 70.4161 0.300293 74.5482 0.300293 79.0093C0.300293 90.4625 9.58487 99.747 21.038 99.747C32.4911 99.747 41.7757 90.4625 41.7757 79.0093C41.7757 74.5477 40.3667 70.4152 37.9694 67.0324C37.8866 66.7308 37.7276 66.439 37.4818 66.1813L22.4849 50.4594Z" fill="#4B4FD5"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M22.4849 50.4594C21.697 49.6333 20.3785 49.6333 19.5905 50.4594L4.59365 66.1813C4.34762 66.4393 4.18848 66.7315 4.10577 67.0335C1.70896 70.4161 0.300293 74.5482 0.300293 79.0093C0.300293 90.4625 9.58487 99.747 21.038 99.747C32.4911 99.747 41.7757 90.4625 41.7757 79.0093C41.7757 74.5477 40.3667 70.4152 37.9694 67.0324C37.8866 66.7308 37.7276 66.439 37.4818 66.1813L22.4849 50.4594Z" fill="#17164B"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M77.1763 50.4594C76.3884 49.6333 75.0699 49.6333 74.282 50.4594L59.2851 66.1813C59.039 66.4393 58.8799 66.7315 58.7972 67.0335C56.4004 70.4161 54.9917 74.5482 54.9917 79.0093C54.9917 90.4625 64.2763 99.747 75.7294 99.747C87.1825 99.747 96.4671 90.4625 96.4671 79.0093C96.4671 74.5477 95.0581 70.4152 92.6608 67.0324C92.578 66.7308 92.419 66.439 92.1732 66.1813L77.1763 50.4594Z" fill="#4B4FD5"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M77.1763 50.4594C76.3884 49.6333 75.0699 49.6333 74.282 50.4594L59.2851 66.1813C59.039 66.4393 58.8799 66.7315 58.7972 67.0335C56.4004 70.4161 54.9917 74.5482 54.9917 79.0093C54.9917 90.4625 64.2763 99.747 75.7294 99.747C87.1825 99.747 96.4671 90.4625 96.4671 79.0093C96.4671 74.5477 95.0581 70.4152 92.6608 67.0324C92.578 66.7308 92.419 66.439 92.1732 66.1813L77.1763 50.4594Z" fill="#17164B"/>
        </svg>

  section.pt-px
    //- (no drips)
    template(v-if="props.drips && !props.drips.length")
      info-bar.mt-112(:btnLabel="props.canEdit && 'Add Drips'", @btnClick="$emit('editSplits')")
        div.w-full.text-center {{ props.canEdit ? 'Your community ' : 'This community ' }} is not #[b dripping funds] to others.

    //- (drips)
    template(v-else-if="props.drips")
      ul.flex.flex-wrap.pl-52.pr-60.-mt-px
        //- TODO - mobile use :nth-child for m-l/r
        //- drips...
        li.project-drips__drip(v-for="(drip, i) in props.drips", :class="{'ml-auto': i % 6 === 0, 'mr-auto': i % 6 === 5}")
          //- (drip head)
          .block.-mt-px.mb-32(v-if="i < 3")
            img.mx-auto(src="../assets/icons/drip-off-point.svg")
          //- drip
          router-link.block.relative.transition.duration-150.transform.notouch_hover_translate-y-20.group(:to="{name: 'user', params: { address: drip.receiver }}")
            //- drip graphic
            img.w-full.block(src="../assets/icons/drip-big.svg", alt="blue raindrop")
            //- text
            .absolute.overlay.flex.items-center.justify-center
              div.text-center.text-violet-650
                //- percent
                .pt-24.text-6xl.font-bold.font-cheeeff.text-8xlff.font-normal.notouch_group-hover_text-greenbright-500(style="margin-top:38%")
                  | {{ parseInt(drip.percent) }}
                  span(style="font-size: 0.75em") %
                .mt-20.font-semibold.text-whiteff.text-lg.notouch_group-hover_text-white
                  addr(:address="drip.receiver", :key="drip.receiver")
                .mt-10.mb-2.flex.justify-center.w-full
                  user-avatar(:address="drip.receiver", blockieSize="16", :key="drip.receiver")
                //- TODO calc amount
                //- .mt-8.font-mono.text-ms.text-violet-650 XXX Ð/mo
                //- .mb-20

</template>

<style>
.project-drips__drip{
  width: calc((292.4 + 40) / (1128.53 + 40) * 100%);
  margin-bottom:  calc(40 / (1128.53 + 40) * -100%);
  padding: 0 calc(20 / (1128.53 + 40) * 100%);
}
</style>
