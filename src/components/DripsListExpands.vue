<script setup>
import { ref, computed, inject } from 'vue'
import Addr from '@/components/Addr.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import UserAvatarsRow from '@/components/UserAvatarsRow.vue'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle.vue'
import SvgChevronDown from '@/components/SvgChevronDown.vue'
import UserTagSmall from '@/components/UserTagSmall.vue'
import SvgPen from '@/components/SvgPen.vue'
import SvgDai from '@/components/SvgDai.vue'
import { toDAI, toDAIPerMo } from '@/utils'
import { BigNumber as bn } from 'ethers'

const props = defineProps({
  address: { type: String, default: undefined },
  drips: { type: Array, default: undefined },
  direction: { type: String, default: 'out' },
  canEdit: { type: Boolean, default: false }
})

const emit = defineEmits(['editDrips'])

// unique addresses
const addresses = computed(() => {
  let addresses = props.direction === 'in' ? props.drips?.map(d => d.sender)
      : props.drips?.filter(d => d.receiver.length).map(d => d.receiver[0])
  return addresses && [...new Set(addresses)] // de-dupe
})

// balance
const withdrawable = inject('withdrawable')
const balance = computed(() => withdrawable.value ? toDAI(withdrawable.value) : '...')

// calc monthly
const totalMonthlyRate = computed(() => {
  const amtDrips = props.drips?.filter(d => d.amtPerSec !== undefined)
  if (props.drips?.length > 1) {
    const totalAmtPerSec = amtDrips.reduce((acc, curr) => acc.add(curr.amtPerSec), bn.from(0))
    return toDAIPerMo(totalAmtPerSec)
  }
  return '0'
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

// TODO calc total given (includes drips over time?)

const dripRt = (drip) => {
  const name = drip.amtPerSec ? 'stream' : drip.percent ? 'split' : 'drip'
  return { name, params: { id: drip.id }}
}

// ui
const expanded = ref(false)
const toggle = () => { expanded.value = !expanded.value }
</script>

<template lang="pug">
section.drips-list-expands.font-semibold.relative.w-full
  //- background
  .absolute.overlay.flex(v-show="expanded", :class="{'pt-60': props.direction === 'out'}")
    .w-full.bg-gradient-to-b.from-transparent.via-indigo-950.to-transparent

  //- body
  .relative.z-10.flex.flex-col.px-24(:class="{'flex-col-reverse': props.direction === 'in'}")
    //- drip icon
    //- .w-full.flex.justify-center.opacity-90(:class="{'my-8': !expanded, 'my-24': expanded}")
      .relative.w-80.h-80.flex.items-center.justify-center.overflow-visible.cursor-pointer(style="font-size:2.15em", @click.stop="toggle")
        | 💧
    .w-full.flex.justify-center.opacity-90
      .h-80.overflow-hidden.items-center.flex
        div.animate-falling(v-if="canEdit || (props.drips && props.drips.length)")
          .relative.w-80.h-104.flex.items-center.justify-center.overflow-visible.cursor-pointer(style="font-size:2.15em")
            | 💧
          .relative.w-80.h-104.flex.items-center.justify-center.overflow-visible.cursor-pointer(style="font-size:2.15em")
            | 💧
          .relative.w-80.h-104.flex.items-center.justify-center.overflow-visible.cursor-pointer(style="font-size:2.15em")
            | 💧

    div
      .w-full.flex.justify-center
        //- (loading...)
        template(v-if="!addresses")
          .h-64.px-32.rounded-full.bg-indigo-950.text-violet-650.flex.items-center.justify-center.text-md.animate-pulse Loading...

        //- (no drips)
        template(v-else-if="!addresses.length")
          //- empty / add drip btn
          button.h-80.px-40.rounded-full.bg-indigo-950ff.bg-indigo-700ff.text-violet-650.flex.items-center.justify-center.text-md.border-dashed.border-3.text-violet-700.min-w-144.notouch_hover_text-violet-650.group(:disabled="!props.canEdit", :class="{'pointer-events-none': !props.canEdit}", @click="$emit('editDrips')")
            template(v-if="props.canEdit")
              svg-plus-minus-radicle.h-26.w-26

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
            p.h-64.pl-28.pr-16.rounded-full.bg-indigo-950.text-white.flex.items-center.justify-center(v-show="expanded")
              //- label
              .text-md
                template(v-if="props.direction === 'in'")
                  | Drips In
                  //- | {{ addresses.length }} address{{ addresses.length > 1 ? 'es drip' : ' drips'}} to #[addr(:address="props.address", :youOn="true")]
                template(v-else)
                  | Drips Out
                  //- 
                    template(v-if="props.canEdit")
                      | You drip&nbsp;
                    template(v-else)
                      | #[addr(:address="props.address", :youOn="true")] drips&nbsp;
                    | to {{ addresses.length }} address{{ addresses.length > 1 ? 'es' : ''}}
              
              //- toggle icon
              svg-chevron-down.ml-7.w-28.h-28.transform.origin-center.rotate-180.text-violet-650

      //- (expanded list)
      template(v-if="props.drips && expanded")      
        section.mt-40.relative.flex.flex-col(:class="{'pb-104': expanded && props.direction === 'out'}")

          //- (balance + edit)
          //- .flex.flex-wrap.justify-center.text-base.text-white.mb-8(v-if="props.canEdit")
            //- balance
            button.h-36.bg-indigo-950.rounded-full.btn-outline-green.border-2.flex.border-violet-700.rounded-full.items-center.text-violet-650.pl-14.pr-10.mx-2(@click="$emit('editDrips')")
              | Balance {{ balance }}
              svg-dai.ml-4(size="xs")
              //- svg-plus-minus-radicle.w-15.h-15.ml-10
            
            //- (edit btn)
            button.h-36.bg-indigo-950.rounded-full.btn-outline-green.border-2.flex.border-violet-700.rounded-full.items-center.text-violet-650.pl-14.pr-2.mx-2(@click="$emit('editDrips')")
              .text-ms Edit Drips
              svg-pen.mx-5.h-16.w-16

          //- (stats)
          .flex.flex-wrap.justify-center.text-base.text-white.mb-12
            //- count
            .flex.bg-violet-650.rounded-full.items-center.h-36.px-18.mx-2(v-if="props.drips.length > 1")
              template(v-if="props.direction === 'in'")
                | {{ addresses.length }} address{{ addresses.length > 1 ? 'es' : '' }}
              template(v-else)
                | {{ addresses.length }} recipient{{ addresses.length > 1 ? 's' : '' }}
            
            //- (total monthly)
            .flex.bg-violet-650.rounded-full.items-center.h-36.px-18.mx-2(v-if="totalMonthlyRate !== '0' && props.drips.length > 1")
              template(v-if="props.direction === 'in'") drip {{ totalMonthlyRate }}
              template(v-else) dripping {{ totalMonthlyRate }}
              svg-dai.ml-4(size="xs")
              | /mo

            //- (avg percent)
            .flex.bg-violet-650.rounded-full.items-center.h-36.px-18.mx-2(v-if="avgPct && props.drips.length > 1")
              template(v-if="props.direction === 'in'")
                | split {{ avgPct }}% avg.
              template(v-if="props.direction === 'out'")
                | splitting {{ totalPct }}%

          //- list
          ul.w-full.flex.flex-wrap.justify-center
            //- drips...
            li(v-for="drip in props.drips")
              router-link.btn-focus-violet.rounded-full.block.my-4.mx-3(:to="dripRt(drip)")
                user-tag-small.bg-indigo-700(:address="props.direction === 'in' ? drip.sender : drip.receiver[0]", :drip="drip")
          
          //- (edit btn)
          .flex.justify-center.w-full.mt-24(v-if="props.canEdit")
            button.h-36.bg-indigo-950.rounded-full.btn-outline-green.border-2.flex.border-violet-700.rounded-full.items-center.text-violet-650.pl-14.pr-2.mx-3(@click="$emit('editDrips')")
              .text-ms Edit Drips
              svg-pen.mx-5.h-16.w-16
          


          //- (edit btn)
          //- .sticky.bottom-12.left-0.w-full.flex.justify-center.mt-20.-mb-8(v-if="props.canEdit")
            button.py-4.pl-11.leading-none.rounded-full.flex.items-center.text-ms.btn-outline-green.border.bg-indigo-900(@click="$emit('editDrips')")
              | Edit Drips
              svg-pen.mx-5.h-16.w-16

</template>
