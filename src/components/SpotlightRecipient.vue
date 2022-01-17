<script setup>
import { ref, computed, onMounted, toRaw } from 'vue'
import { utils } from 'ethers'
import store from '@/store'
import Addr from '@/components/Addr'
import UserAvatar from '@/components/UserAvatar'

const props = defineProps(['recipient', 'allSplits'])

const supporters = computed(() => {
  if (!props.allSplits) {
    return []
  }
  // filter events by recipient
  const events = props.allSplits.filter(event => event.args[1].find(receiver => receiver[0].toLowerCase() === props.recipient.toLowerCase()))
  // map to senders
  return events.map(e => e.args[0])
})
</script>

<template lang="pug">
//- .h-80.bg-indigo-950.rounded-full.flex.items-center.justify-center
  .px-20.text-md.text-greenbright-500.flex.items-center.w-full.justify-center
    user-avatar.w-24.h-24(:address="props.recipient")
    .inline.flex-shrink-0.leading-none
      | #[addr.ml-12.font-bold(:address="props.recipient")] is receiving drips from #[b {{ supporters.length }} addresses].

.h-160.flex.flex-wrap.justify-center
  .flex.-mr-40
    router-link.h-80.spotlight-recipient.panel.bg-indigo-950.rounded-2xlb.p-12.flex.flex-col.justify-between.notouch_hover_ring.notouch_hover_ring-violet-700(:to="{name: 'user-drips-in', params: {address: props.recipient }}")

      .px-16.pt-12.text-md.text-greenbright-400.flex.items-center.w-full.justify-centerff
        user-avatar.w-28.h-28.-mb-5ff(:address="props.recipient")
        .inline.flex-shrink-0.leading-none
          | #[addr.ml-12.font-bold(:address="props.recipient")] is receiving drips from #[b {{ supporters.length }} addresses].

  .flex.justify-end.mt-48
    //- DRIPW ROW
    .flex.h-80.justify-center.rounded-full.text-violet-650.text-md.relative

      .h-80.flex.items-center.rounded-full.bg-indigo-700.px-12.mr-2.w-260ff.border-2.border-transparent.notouch_hover_border-violet-600
        template(v-if="supporters")
          ul.flex.justify-center.w-full
            li(v-for="(supporter, i) in supporters", :class="{'-ml-20': i > 0}")
              //- sender avatar / blockie
              user-avatar.w-54.h-54.flex-shrink-0.bg-indigo-800(:address="supporter", blockieSize="44", :key="supporter")
        template(v-else)
          .animate-pulse.text-xl ...

      //- drip icon
      .w-80.h-80.flex.items-center.justify-center.bg-indigo-700.rounded-full.mr-2
        span(style="font-size:1.75em") 💧

      //- .flex-1.flex.bg-indigo-700.rounded-full.px-20.mr-2
        .w-full.flex.items-center.justify-center
          div #[b drip funds] to

      .h-80.w-80.flex.items-center.justify-center.bg-indigo-700.rounded-full.mr-2
        img.h-20(src="~@/assets/icons/arrow-right-violet.svg")

      //- receiver(s)
      .h-80.flex.items-center.justify-end.rounded-full.bg-indigo-700.px-12.w-260ff.border-2.border-transparent.notouch_hover_border-violet-600
        //- (summary - "10 addresses")
        //- template(v-if="isSummary")
          .w-full.text-center.font-bold {{ props.drip.receiver }} addresses
        //- (single receiver)
        //- template(v-else)
        .flex-1.min-w-0.truncate.inline.mx-12.text-center
          .inline
            addr.font-bold.inline(:address="props.recipient", :youOn="true", :key="props.recipient")
        user-avatar.w-54.h-54(:address="props.recipient", blockieSize="44", :key="props.recipient")

//- .flex.h-80.rounded-full.text-violet-650.text-md.relative

  .h-80.flex.items-center.justify-end.rounded-full.bg-indigo-700.px-12.w-260.border-2.border-transparent.notouch_hover_border-violet-600
    //- (summary - "10 addresses")
    //- template(v-if="isSummary")
      .w-full.text-center.font-bold {{ props.drip.receiver }} addresses
    //- (single receiver)
    //- template(v-else)
    .flex-1.min-w-0.truncate.inline.mx-12.text-center
      .inline
        addr.font-bold.inline(:address="props.recipient", :youOn="true", :key="props.recipient")
    user-avatar.w-54.h-54(:address="props.recipient", blockieSize="44", :key="props.recipient")

  .flex-1.flex.bg-indigo-700.rounded-full.px-20.mr-2
    .w-full.flex.items-center.justify-center
      div is #[b receiving drips] from

  .h-80.flex.items-center.rounded-full.bg-indigo-700.px-12.mr-2.w-260.border-2.border-transparent.notouch_hover_border-violet-600
    template(v-if="supporters")
      ul.flex.justify-center.w-full
        li(v-for="(supporter, i) in supporters", :class="{'-ml-20': i > 0}")
          //- sender avatar / blockie
          user-avatar.w-54.h-54.flex-shrink-0.bg-indigo-800(:address="supporter", blockieSize="44", :key="supporter")
    template(v-else)
      .animate-pulse.text-xl ...

  //- drip icon
  //- .w-80.h-80.flex.items-center.justify-center.bg-indigo-700.rounded-full.mr-2
    span(style="font-size:1.75em") 💧

  //- .h-80.w-80.flex.items-center.justify-center.bg-indigo-700.rounded-full.mr-2
    img.h-20(src="~@/assets/icons/arrow-right-violet.svg")

  //- receiver(s)
</template>
