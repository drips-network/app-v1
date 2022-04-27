<script setup>
import { ref, computed, onMounted, toRaw } from 'vue'
import { utils } from 'ethers'
import { formatSplitsEvents } from '@/utils'
import store from '@/store'
import Addr from '@/components/Addr.vue'
import UserAvatar from '@/components/UserAvatar.vue'

const props = defineProps(['spotlight', 'recipient', 'allSplits', 'sender'])
const highlight = computed(() => props.spotlight.highlight)

const supporters = computed(() => {
  if (!props.allSplits) return []
  return props.allSplits
    .filter(split => split.receiver.includes(props.spotlight.address?.toLowerCase()))
    .map(split => split.sender)
  // filter events by recipient
  // const events = props.allSplits.filter(event => event.args[1].find(receiver => receiver[0].toLowerCase() === props.spotlight.address?.toLowerCase()))
  // map to senders
  // return events.map(e => e.args[0])
})

const senderRow = computed(() => {
  // get last update by sender
  const lastUpdate = props.allSplits?.find(e => e.args[0].toLowerCase() === props.spotlight.address?.toLowerCase())
  return lastUpdate && formatSplitsEvents([lastUpdate])[0]
})

const receivers = computed(() => {
  if (!props.allSplits) return []
  return props.allSplits
    .filter(split => split.sender === props.spotlight.address?.toLowerCase())
    .reduce((acc, curr) => acc.concat(curr.receiver), [])
})
</script>

<template lang="pug">
div.mb-196
  .w-full.flex.justify-center
    .min-h-80.flex.items-center.rounded-full.bg-indigo-700ff.py-10.px-6.mr-2
      //- (sender)
      template(v-if="highlight === 'sender'")
        router-link.flex.items-center.mx-6.bg-indigo-700.rounded-full.p-12.notouch_hover_ring.notouch_hover_text-white.transition.duration-150(:to="{name: 'user-drips-out', params: { address: props.spotlight.address }}")
          user-avatar.w-80.h-80(:address="props.spotlight.address", blockieSize="80")
          addr.mx-24.font-semibold.text-xl(:address="props.spotlight.address", :key="props.spotlight.address")

      //- (supporters)
      template(v-else-if="supporters")
        ul.flex.flex-wrap.justify-center.mx-auto.text-violet-650
          //- supporters...
          li(v-for="(supporter, i) in supporters")
            router-link.flex.items-center.bg-indigo-700.rounded-full.p-10.m-2.notouch_hover_ring.notouch_hover_text-white.transition.duration-150(:to="{name: 'user', params: { address: supporter }}")
              //- sender avatar / blockie
              user-avatar.w-44.h-44.flex-shrink-0.bg-indigo-800(:address="supporter", blockieSize="44", :key="supporter")
              addr.mx-16.font-semibold(:address="supporter", :key="supporter")
      template(v-else)
        .animate-pulse.text-xl ...

  //- drip icon
  .w-full.flex.justify-center
    .w-80.h-80.flex.items-center.justify-center.overflow-visible(style="font-size:2.75em") 💧

  //- receiver(s)
  .w-full.flex.justify-center
    .min-h-80.flex.items-center.rounded-2xlb.bg-indigo-700ff.py-10.px-6
      //- (sender)
      template(v-if="highlight === 'receiver'")
        router-link.flex.items-center.mx-6.bg-indigo-700.rounded-full.p-12.notouch_hover_ring.notouch_hover_text-white.transition.duration-150(:to="{name: 'user-drips-in', params: { address: props.spotlight.address }}")
          user-avatar.w-80.h-80(:address="props.spotlight.address", blockieSize="80")
          addr.mx-24.font-semibold.text-xl(:address="props.spotlight.address", :key="props.spotlight.address")

      //- (supporters)
      template(v-else-if="receivers && receivers.length")
        ul.flex.flex-wrap.justify-center.mx-auto.text-violet-650
          li(v-for="(receiver, i) in receivers")
            router-link.flex.items-center.bg-indigo-700.rounded-full.p-10.m-2.notouch_hover_ring.notouch_hover_text-white.transition.duration-150(:to="{name: 'user', params: { address: receiver }}")
              //- sender avatar / blockie
              user-avatar.w-44.h-44.flex-shrink-0.bg-indigo-700(:address="receiver", blockieSize="44", :key="receiver")
              addr.mx-16.font-semibold(:address="receiver", :key="receiver")
      template(v-else)
        .animate-pulse.text-xl ...

</template>
