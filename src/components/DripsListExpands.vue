<script setup>
import { ref, computed } from 'vue'
import Addr from '@/components/Addr.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import UserAvatarsRow from '@/components/UserAvatarsRow.vue'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle.vue'
import SvgChevronDown from '@/components/SvgChevronDown.vue'
import UserTagSmall from '@/components/UserTagSmall.vue'

const props = defineProps({
  address: { type: String, default: undefined },
  drips: { type: Array, default: undefined },
  direction: { type: String, default: 'out' },
  canEdit: { type: Boolean, default: false }
})

const emit = defineEmits(['editDrips'])

const addresses = computed(() => {
  return props.direction === 'in' ? props.drips?.map(d => d.sender)
    : props.drips?.filter(d => d.receiver.length).map(d => d.receiver[0])
})

const expanded = ref(false)
const toggle = () => { expanded.value = !expanded.value }
</script>

<template lang="pug">
section.drips-list-expands.flex.flex-col(:class="{'flex-col-reverse': props.direction === 'in'}")
  //- drip icon
  .w-full.flex.justify-center.my-4.opacity-90
    .relative.w-80.h-80.flex.items-center.justify-center.overflow-visible.cursor-pointer(style="font-size:2.15em", @click.stop="toggle")
      | 💧
      //- button.absolute.left-full.top-0.h-full.flex.items-center(v-show="expanded", @click="expanded = false")
        svg-chevron-down.-ml-16.text-violet-650.w-36.h-36.transform.rotate-180

  div
    .w-full.flex.justify-center
      //- (loading...)
      template(v-if="!addresses")
        .h-80.px-40.rounded-full.bg-indigo-950.font-semibold.text-violet-650.flex.items-center.justify-center.text-md.animate-pulse Loading...

      //- (no drips)
      template(v-else-if="!addresses.length")
        //- empty / add drip btn
        button.h-80.px-40.rounded-full.bg-indigo-950ff.bg-indigo-700ff.font-semibold.text-violet-650.flex.items-center.justify-center.text-md.border-dashed.border-3.text-violet-700.min-w-144.notouch_hover_text-violet-650.group(:disabled="!props.canEdit", :class="{'pointer-events-none': !props.canEdit}", @click="$emit('editDrips')")
          template(v-if="props.canEdit")
            svg-plus-minus-radicle.transform.scale-105.opacity-0.group-hover_opacity-100

      //- (view senders btn)
      template(v-else)
        .relative
          //- toggle button as overlay for accessibility
          button.absolute.z-10.overlay.pointer-events-auto.rounded-full.btn-focus-violet(@click.stop="toggle", aria-label="Toggle List")

          //- (avatars row)
          .rounded-full.flex.justify-center.items-center.bg-indigo-700.p-10(v-show="!expanded")
            //- (addresses)
            //- addresses-tag(:addresses="addresses", :avatarsOnly="true")
            user-avatars-row(:addresses="addresses", :limit="6", height="44")

          //- (summary text)
          p.h-64.pl-24.pr-12.rounded-full.bg-indigo-950.text-violet-650.flex.items-center.justify-center(v-show="expanded")
            .font-semibold.text-ms
              template(v-if="props.direction === 'in'")
                | {{ addresses.length }} address{{ addresses.length > 1 ? 'es drip' : ' drips'}} to #[addr(:address="props.address", :youOn="true")]
              template(v-else)
                | #[addr(:address="props.address", :youOn="true")] drips to {{ addresses.length }} address{{ addresses.length > 1 ? 'es' : ''}}
            //- toggle icon
            svg-chevron-down.ml-7.w-28.h-28.transform.origin-center.rotate-180

    //- (expanded list)
    template(v-if="props.drips && expanded")
      ul.w-full.flex.flex-wrap.justify-center.mt-24
        //- .w-full.flex.my-24
          h2.mx-auto.flex.bg-indigo-950.border-violet-700.rounded-full.items-center.pl-24.pr-20.h-44.font-semiboldff.text-violet-650.text-ms
            div #[b {{ addresses.length }} address{{ addresses.length > 1 ? 'es' : ''}}] {{ addresses.length > 1 ? 'drip' : 'drips'}} to #[addr.font-bold(:address="props.address")]
        //- .w-full.flex.justify-center
          .h-80.w-2.rounded-full.bg-violet-700.my-6
        li(v-for="drip in props.drips")
          user-tag-small(:address="props.direction === 'in' ? drip.sender : drip.receiver[0]", :drip="drip")
          //- router-link.flex.items-center.bg-indigo-700.rounded-full.p-10.my-4.mx-3.notouch_hover_ring.notouch_hover_ring-violet-650.notouch_hover_text-white.transition.duration-150(:to="{name: 'user', params: { address: drip.sender }}")
            //- sender avatar / blockie
            user-avatar.w-44.h-44.flex-shrink-0.bg-indigo-800(:address="drip.sender", blockieSize="44", :key="drip.sender")
            addr.mx-16.font-semibold(:address="drip.sender", :key="drip.sender")

            .h-44.flex.items-center.px-10.bg-indigo-900.rounded-full
              //- drip icon
              div(style="font-size:1.25em") 💧

              //- amount
              div.font-semibold.text-violet-650.mx-6
                template(v-if="drip.amount") {{ drip.amount }}/mo
                template(v-else-if="drip.percent") {{ drip.percent }}%
          //- .w-full.flex.justify-center
            .h-80.w-2.rounded-full.bg-violet-700.my-6

        //- (hide senders btn)
        //- .w-full.flex.justify-center.mt-12
          button.btn.btn-darkest.w-54.h-54(@click.stop="expanded = false")
            svg-chevron-down.text-violet-650.w-32.h-32.transform.rotate-180

</template>
