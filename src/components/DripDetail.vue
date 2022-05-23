<script setup>
import UserTagMedium from '@/components/UserTagMedium.vue'  
import DripDescription from '@/components/DripDescription.vue'  
import SvgDai from '@/components/SvgDai.vue'
import { toDAIPerMo } from '@/utils'

const props = defineProps(['drip'])
</script>

<template lang="pug">
.drip-detail.pt-80.lg_pt-40.pb-80.font-semibold
  //- (error)
  template(v-if="props.drip && props.drip.error")
    .flex.justify-center.w-full
      .h-80.px-40.rounded-full.bg-indigo-950.text-violet-650.flex.items-center.justify-center.text-md
        | Error loading drip!

  //- 
  template(v-else)
    //- sender
    .flex.justify-center.w-full.relative.z-10
      template(v-if="!props.drip")
        .h-80.px-40.rounded-full.bg-indigo-950.text-violet-650.flex.items-center.justify-center.text-md.animate-pulse
          | Loading...
      template(v-else)
        router-link.btn-focus-violet.rounded-full(:to="{name: 'user', params: {address: props.drip.sender}}")
          user-tag-medium.bg-indigo-700(:address="props.drip.sender")

    .relative.flex.items-center.justify-center.py-72
    
      //- drip icon
      //- .w-full.flex.justify-center.opacity-90
        .h-72.w-80.overflow-hidden.items-center.flex
          div.animate-falling
            .relative.w-80.h-80.flex.items-center.justify-center.cursor-pointer(style="font-size:2em")
              | 💧
            .relative.w-80.h-80.flex.items-center.justify-center.cursor-pointer(style="font-size:2em")
              | 💧
            .relative.w-80.h-80.flex.items-center.justify-center.cursor-pointer(style="font-size:2em")
              //- | 💧 

      
      .absolute.overlay.flex.items-center.justify-center.overflow-hidden
        div.animate-falling
          .relative.w-80.h-72.flex.items-center.justify-center.cursor-pointer(style="font-size:2em")
            | 💧
          .h-72
          .relative.w-80.h-72.flex.items-center.justify-center.cursor-pointer(style="font-size:2em")
            | 💧
          .h-72
          .relative.w-80.h-72.flex.items-center.justify-center.cursor-pointer(style="font-size:2em")
            //- | 💧
          .h-72

      template(v-if="props.drip")
        //- description
        p.flex.justify-center.w-full.relative.z-10
          //- .h-60.flex.items-center.justify-center.bg-indigo-700.rounded-full.px-28.font-semibold.text-md.text-violet-650ff
            template(v-if="props.drip.amtPerSec")
              span drips #[span.text-white.mr-3 {{ toDAIPerMo(props.drip.amtPerSec) }} #[svg-dai.inline-block(style="height:0.8em; transform:translateY(-0.07em); margin-leftff: 0.1em")]] monthly
          drip-description.h-60.flex.items-center.justify-center.bg-indigo-700.rounded-full.px-28.font-semibold.text-lg.text-violet-600(:drip="drip", valueColor="text-white")
          
      
      //- drip icon
      //- .w-full.flex.justify-center.opacity-90
        .h-72.w-80.overflow-hidden.items-center.flex
          div.animate-falling
            .relative.w-80.h-60.flex.items-center.justify-center.cursor-pointer(style="font-size:2em")
              | 💧
            .relative.w-80.h-60.flex.items-center.justify-center.cursor-pointer(style="font-size:2em")
              | 💧
            .relative.w-80.h-60.flex.items-center.justify-center.cursor-pointer(style="font-size:2em")
              //- | 💧

    //- receiver
    .flex.justify-center.w-full.relative
      template(v-if="!props.drip")
        .h-80.px-40.rounded-full.bg-indigo-950.text-violet-650.flex.items-center.justify-center.text-md.animate-pulse
          | Loading...
      template(v-else)
        router-link.btn-focus-violet.rounded-full(:to="{name: 'user', params: {address: props.drip.receiver}}")
          user-tag-medium.bg-indigo-700(:address="props.drip.receiver")

</template>
