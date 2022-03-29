<script setup>
import UserAvatar from '@/components/UserAvatar.vue'
import Addr from '@/components/Addr.vue'
import SvgDai from '@/components/SvgDai.vue'
const props = defineProps(['address', 'drip'])
</script>

<template lang="pug">
router-link.my-4.mx-3.user-tag-small.flex.items-center.bg-indigo-700.rounded-full.p-8.btn-focus-violet.transition.duration-150(:to="{name: 'user', params: { address: props.address }}")
  //- sender avatar / blockie
  user-avatar.w-44.h-44.flex-shrink-0.bg-indigo-800(:address="props.address", blockieSize="44", :key="props.address")
  addr.mx-16.font-semibold(:address="props.address", :key="props.address")

  //- (drip)
  template(v-if="props.drip")
    .h-44.flex.items-center.px-8.bg-indigo-900.rounded-full
      //- drip icon
      div(style="font-size:1.25em") 💧

      //- amount
      div.font-semibold.text-violet-650.mx-6
        template(v-if="props.drip.amount")
          .flex.items-center.leading-none
            svg-dai(size="xs", style="margin-right:0.15em")
            | {{ props.drip.amount }}/mo
        template(v-else-if="props.drip.percent") {{ props.drip.percent }}%
</template>
