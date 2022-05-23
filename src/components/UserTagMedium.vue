<script setup>
import UserAvatar from '@/components/UserAvatar.vue'
import Addr from '@/components/Addr.vue'
import SvgDai from '@/components/SvgDai.vue'
const props = defineProps(['address', 'drip'])
</script>

<template lang="pug">
.user-tag-medium.flex.items-center.rounded-full.p-10.transition.duration-150
  //- sender avatar / blockie
  user-avatar.w-56.h-56.flex-shrink-0.bg-indigo-800(:address="props.address", :key="props.address")
  addr.mx-16.font-semibold.text-lg(:address="props.address", :key="props.address")

  //- (drip)
  //- template(v-if="props.drip")
    .h-64.flex.items-center.px-8.bg-indigo-900.rounded-full
      //- drip icon
      div.mx-1(v-if="props.drip.percent", style="font-size:1.2em") 💦
      div(v-else, style="font-size:1.25em") 💧

      //- amount
      div.font-semibold.text-violet-650.mx-6
        template(v-if="props.drip.amount")
          .flex.items-center.leading-none
            | {{ props.drip.amount }}
            svg-dai(size="xs", style="margin-left:0.375em")
            | /mo
        template(v-else-if="props.drip.percent") {{ props.drip.percent }}%
</template>
