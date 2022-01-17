<script setup>
import { ref, computed, onMounted, toRaw } from 'vue'
import { utils } from 'ethers'
import store from '@/store'
import Addr from '@/components/Addr'
import UserAvatar from '@/components/UserAvatar'

const props = defineProps(['recipient', 'allSplits', 'sender'])

const supporters = computed(() => {
  if (!props.allSplits) {
    return []
  }
  // filter events by recipient
  const events = props.allSplits.filter(event => event.args[1].find(receiver => receiver[0].toLowerCase() === props.recipient.toLowerCase()))
  // map to senders
  return events.map(e => e.args[0])
})

// const receivers = computed(() => {
//   if (!props.allSplits || !props.sender) {
//     return []
//   }
//   // get last update by sender
//   const lastUpdate = props.allSplits.find(e => e.args[0].toLowerCase() === props.sender.toLowerCase())
//   return lastUpdate.args[0]
// })
</script>

<template lang="pug">
div.mb-96
  .flex.justify-start
    .h-80.bg-indigo-950.flex.items-center.rounded-full
      .pl-24.pr-36.text-md.text-greenbright-400.text-violet-650ff.flex.items-center
        user-avatar.w-24.h-24(:address="props.recipient")
        .inline.flex-shrink-0.leading-none
          | #[addr.ml-12.font-bold(:address="props.recipient")] #[span.opacity-90 receives drips from] #[b {{ supporters.length }} addresses].

  .mt-10.pr-8.flex.h-80.justify-end.rounded-full.text-violet-650.text-md.relative

    .h-80.flex.items-center.rounded-full.bg-indigo-700.py-10.px-6.w-260ff.mr-2
      template(v-if="supporters")
        ul.flex.justify-center.w-full
          li.flex.items-center.bg-indigo-850.rounded-full.p-10.mx-2(v-for="(supporter, i) in supporters")
            //- sender avatar / blockie
            user-avatar.w-44.h-44.flex-shrink-0.bg-indigo-800(:address="supporter", blockieSize="44", :key="supporter")
            addr.mx-16.font-semibold(:address="supporter", :key="supporter")
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

//- .flex.flex-wrap.text-violet-650.text-md

  //- receiver
  .h-80.flex.items-center.rounded-full.bg-indigo-700.px-12.mr-2.w-260ff.border-2.border-transparent.notouch_hover_border-violet-600
    //- sender avatar / blockie
    user-avatar.w-54.h-54.flex-shrink-0(:address="props.recipient", blockieSize="44", :key="props.recipient")

    .flex-1.min-w-0.truncate.inline.mx-16.text-center
      .inline
        addr.font-bold.inline(:address="props.recipient", :key="props.recipient")

  //- text
  .flex.bg-indigo-700.rounded-full.px-40.mr-2
    .w-full.flex.items-center.justify-center
      div receives #[b 💧 drips] from

  //- receiver
  .h-80.flex.items-center.rounded-full.bg-indigo-700.py-10.px-6.mr-2.border-2.border-transparent.notouch_hover_border-violet-600
    template(v-if="supporters")
      ul.flex.justify-center.w-full
        li.flex.items-center.bg-indigo-800.p-10.rounded-full.mx-2(v-for="(supporter, i) in supporters")
          //- sender avatar / blockie
          user-avatar.w-44.h-44.flex-shrink-0.bg-indigo-800(:address="supporter", blockieSize="44", :key="supporter")
          addr.mx-12.font-semibold(:address="supporter", :key="supporter")
    template(v-else)
      .animate-pulse.text-xl ...

//- .h-80.bg-indigo-950.rounded-full.flex.items-center.justify-center
  .px-20.text-md.text-greenbright-500.flex.items-center.w-full.justify-center
    user-avatar.w-24.h-24(:address="props.recipient")
    .inline.flex-shrink-0.leading-none
      | #[addr.ml-12.font-bold(:address="props.recipient")] is receiving drips from #[b {{ supporters.length }} addresses].

//- .h-160.flex.flex-wrap.justify-center
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
