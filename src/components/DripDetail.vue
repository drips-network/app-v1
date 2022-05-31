<script setup>
import { computed } from 'vue'
import UserTagMedium from '@/components/UserTagMedium.vue'  
import DripDescription from '@/components/DripDescription.vue'  
import SvgDai from '@/components/SvgDai.vue'
import { toDAIPerMo, toDAI } from '@/utils'

const props = defineProps(['drip'])

// is give? (no drip anim)
const isStaticDrip = computed(() => props.drip.amount && !props.drip.amtPerSec)
</script>

<template lang="pug">
article.drip-detail.flex.-mt-88
  //- centered body
  .m-auto.py-160.font-semibold
    //- (error)
    template(v-if="props.drip && props.drip.error")
      .flex.justify-center.w-full
        .h-80.px-40.rounded-full.bg-indigo-950.text-violet-650.flex.items-center.justify-center.text-md
          | Error loading drip!

    //- 
    template(v-else)
      //- sender
      .flex.justify-center.w-full.relative.z-10
        //- (loading)
        template(v-if="!props.drip")
          .h-80.px-40.rounded-full.bg-indigo-950.text-violet-650.flex.items-center.justify-center.text-md.animate-pulse
            | Loading...
        //- (sender tag)
        template(v-else)
          router-link.btn-focus-violet.rounded-full(:to="{name: 'user', params: {address: props.drip.sender}}")
            user-tag-medium.bg-indigo-700(:address="props.drip.sender")

      .relative.flex.flex-col.justify-center

        //- (loading drip content / static drip in icon)
        template(v-if="!props.drip || isStaticDrip")
          .relative.w-full.h-72.flex.items-center.justify-center(style="font-size:2em")
            | 💧

        //- (drip animation)
        template(v-else)
          .absolute.overlay.flex.items-center.justify-center.overflow-hidden
            div.animate-falling
              .relative.w-80.h-72.flex.items-center.justify-center(style="font-size:2em")
                | 💧
              .h-72
              .relative.w-80.h-72.flex.items-center.justify-center(style="font-size:2em")
                | 💧
              .h-72
              .h-72
              .h-72

        template(v-if="props.drip")
          //- description
          p.flex.justify-center.w-full.relative.z-10(:class="{'my-72': !isStaticDrip}")
            .h-60.flex.items-center.justify-center.bg-violet-600.rounded-full.px-28.font-semibold.text-lg
              //- (stream)
              template(v-if="props.drip.amtPerSec")
                span #[span.inline-block {{ toDAIPerMo(props.drip.amtPerSec) }}] #[svg-dai.inline-block(style="height:0.8em; transform:translateY(-0.07em); margin-left: .12em")]/mo
              //- (split)
              template(v-else-if="props.drip.percent")
                span {{ props.drip.percent }}% of incoming drips
              //- (give)
              template(v-else-if="props.drip.amount")
                span #[span.inline-block {{ toDAI(props.drip.amount) }}] #[svg-dai.inline-block(style="height:0.8em; transform:translateY(-0.07em); margin-left: .12em")]
            
          //- (static drip icon - out)
          template(v-if="isStaticDrip")
            .relative.w-full.h-72.flex.items-center.justify-center(style="font-size:2em")
              | 💧

      //- receiver
      .flex.justify-center.w-full.relative
        //- (loading)
        template(v-if="!props.drip")
          .h-80.px-40.rounded-full.bg-indigo-950.text-violet-650.flex.items-center.justify-center.text-md.animate-pulse
            | Loading...
        //- (sender tag)
        template(v-else)
          router-link.btn-focus-violet.rounded-full(:to="{name: 'user', params: {address: props.drip.receiver}}")
            user-tag-medium.bg-indigo-700(:address="props.drip.receiver")

</template>
