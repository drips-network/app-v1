<script setup>
import { ref, computed } from 'vue'
import Addr from '@/components/Addr.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import UserAvatarsRow from '@/components/UserAvatarsRow.vue'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle.vue'
import SvgChevronDown from '@/components/SvgChevronDown.vue'
import UserTagSmall from '@/components/UserTagSmall.vue'
import SvgPen from '@/components/SvgPen.vue'
import SvgDai from '@/components/SvgDai.vue'
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

// calc monthly
const totalMonthlyRate = computed(() => {
  const amtDrips = props.drips?.filter(d => d.amount !== undefined)
  if (props.drips?.length > 1) {
    return amtDrips.reduce((acc, curr) => acc + curr.amount, 0)
  }
  return false
})

// calc percents
const pctDrips = computed(() => props.drips?.filter(d => d.percent !== undefined) || [])

const totalPct = computed(() => pctDrips.value.reduce((acc, curr) => acc + curr.percent, 0))

const avgPct = computed(() => {
  if (pctDrips.value.length && totalPct.value) {
    return (totalPct.value / pctDrips.value.length).toFixed(1)
  }
  return false
})

// ui
const expanded = ref(false)
const toggle = () => { expanded.value = !expanded.value }
</script>

<template lang="pug">
section.drips-list-expands.flex.flex-col(:class="{'flex-col-reverse': props.direction === 'in'}")
  //- drip icon
  .w-full.flex.justify-center.my-3.opacity-90
    .relative.w-80.h-80.flex.items-center.justify-center.overflow-visible.cursor-pointer(style="font-size:2.15em", @click.stop="toggle")
      | 💧

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
            svg-plus-minus-radicle.transform.scale-105

      //- (view senders btn)
      template(v-else)
        .relative
          //- toggle button as overlay for accessibility
          button.absolute.z-10.overlay.pointer-events-auto.rounded-full(@click.stop="toggle", aria-label="Toggle List", :class="{'border-2 border-violet-650 notouch_hover_ring notouch_hover_ring-violet-650': expanded, 'btn-focus-violet': !expanded}")

          //- (avatars row)
          .rounded-full.flex.justify-center.items-center.bg-indigo-700.p-10(v-show="!expanded")
            //- (addresses)
            //- addresses-tag(:addresses="addresses", :avatarsOnly="true")
            user-avatars-row(:addresses="addresses", :limit="6", height="44")

          //- (summary text)
          p.h-64.pl-24.pr-12.rounded-full.bg-indigo-950.text-violet-650.flex.items-center.justify-center(v-show="expanded")
            .font-semibold.text-md
              template(v-if="props.direction === 'in'")
                | Supporters
                //- | {{ addresses.length }} address{{ addresses.length > 1 ? 'es drip' : ' drips'}} to #[addr(:address="props.address", :youOn="true")]
              template(v-else)
                | Receivers
                //- template(v-if="props.canEdit")
                //-   | You drip&nbsp;
                //- template(v-else)
                //-   | #[addr(:address="props.address", :youOn="true")] drips&nbsp;
                //- | to {{ addresses.length }} address{{ addresses.length > 1 ? 'es' : ''}}
            //- toggle icon
            svg-chevron-down.ml-7.w-28.h-28.transform.origin-center.rotate-180

    //- (expanded list)
    template(v-if="props.drips && expanded")      
      section.mt-24.relative
        //- list
        ul.w-full.flex.flex-wrap.justify-center
          //- drips...
          li(v-for="drip in props.drips")
            user-tag-small(:address="props.direction === 'in' ? drip.sender : drip.receiver[0]", :drip="drip")
        
        //- (stats)
        .flex.flex-wrap.justify-center.mt-12.text-base
          //- count
          .flex.bg-indigo-950.border-violet-700.rounded-full.items-center.h-40.px-22.font-semibold.text-violet-650.mx-1(v-if="props.drips.length > 4")
            | {{ props.drips.length }} supporters
          
          //- (total monthly)
          .flex.bg-indigo-950.border-violet-700.rounded-full.items-center.h-40.px-22.font-semibold.text-violet-650.mx-1(v-if="totalMonthlyRate")
            svg-dai.mr-2(size="xs")
            | {{ totalMonthlyRate }}/mo

          //- (avg percent)
          .flex.bg-indigo-950.border-violet-700.rounded-full.items-center.h-40.px-22.font-semibold.text-violet-650.mx-1(v-if="avgPct")
            template(v-if="props.direction === 'in'")
              | {{ avgPct }}% avg.
            template(v-if="props.direction === 'out'")
              | {{ totalPct }}% total

          //- (edit btn)
          .h-40.p-6.bg-indigo-950.rounded-full.flex(v-if="props.canEdit")
            button.btn-outline-green.border.flex.border-violet-700.rounded-full.items-center.font-semibold.text-violet-650.pl-11.pr-2.mx-1(@click="$emit('editDrips')")
              .text-ms Edit Drips
              svg-pen.mx-5.h-16.w-16


        //- (edit btn)
        //- .sticky.bottom-12.left-0.w-full.flex.justify-center.mt-20.-mb-8(v-if="props.canEdit")
          button.py-4.pl-11.leading-none.rounded-full.flex.items-center.text-ms.btn-outline-green.border.bg-indigo-900.font-semibold(@click="$emit('editDrips')")
            | Edit Drips
            svg-pen.mx-5.h-16.w-16

</template>
