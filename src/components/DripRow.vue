<script setup>
import { computed } from 'vue'
import UserAvatar from '@/components/UserAvatar.vue'
import Addr from '@/components/Addr.vue'
import SvgDai from '@/components/SvgDai.vue'
import FlexTruncate from '@/components/FlexTruncate.vue'
import AddressesTag from '@/components/AddressesTag.vue'
const props = defineProps(['drip', 'alternateColors'])
const isMultiple = computed(() => props.drip.receiver.length > 1)
const altBg = drip => drip.percent && props.alternateColors
const receiverRt = computed(() => {
  if (isMultiple.value) {
    return { name: 'user-drips-out', params: { address: props.drip.sender } }
  }
  return { name: 'user', params: { address: props.drip.receiver[0] } }
})
</script>

<template lang="pug">
.drip-row.flex.h-80.rounded-full.text-violet-650.text-md.relative
  //- drip icon
  //- .w-80.h-80.mr-2.flex.items-center.justify-center.bg-indigo-700.rounded-full
    //- img(src="~@/assets/icons/drip-row-icon.svg")
    span(style="font-size:1.8em") 💧

  router-link.h-80.flex.items-center.rounded-full.bg-indigo-700.px-12.mr-2.w-260.border-2.border-transparent.notouch_hover_border-violet-600(:class="{'bg-indigo-800': altBg(drip) }", :to="{name: 'user', params: { address: props.drip.sender }}")
    //- sender avatar / blockie
    user-avatar.w-54.h-54.flex-shrink-0(:address="props.drip.sender", blockieSize="44", :key="props.drip.sender")

    flex-truncate.flex-1.mx-14.text-center
      addr.font-bold.inline(:address="props.drip.sender", :youOn="true", :key="props.drip.sender")

  //- drip icon
  .w-80.h-80.flex.items-center.justify-center.bg-indigo-700.rounded-full.mr-2(:class="{'bg-indigo-800': altBg(drip) }")
    //- img(src="~@/assets/icons/drip-row-icon.svg")
    span(v-if="props.drip.amount", style="font-size:1.75em") 💧
    span(v-else-if="props.drip.percent", style="font-size:1.8em") 💧

  .flex-1.flex.bg-indigo-700.rounded-full.px-20.mr-2(:class="{'bg-indigo-800': altBg(drip) }")

    .w-full.flex.items-center.justify-center
      template(v-if="props.drip.amount")
        //- span #[addr.font-bold(:address="props.drip.sender")]
        span <b>#[svg-dai.inline-block.mr-1(style="height:0.9em; transform:translateY(-0.07em)")]{{ props.drip.amount }}</b> every month
        //- span #[addr.font-bold(:address="props.drip.receiver")]

      template(v-else-if="props.drip.percent")
        //- span #[addr.font-bold(:address="props.drip.sender")]
        span <b>{{ parseFloat(props.drip.percent.toFixed(1)) }}%</b> of incoming drips
        //- span #[addr.font-bold(:address="props.drip.receiver")]

    //- .w-full.flex.items-center.justify-between.text-violet-650.px-24
      template(v-if="props.drip.amount")
        span #[addr.font-bold.mr-10(:address="props.drip.sender")] drips
        span <b>#[svg-dai.inline-block(style="height:0.8em; transform:translateY(-0.07em)")]{{ props.drip.amount }}</b> every month
        span to #[addr.font-bold.ml-10(:address="props.drip.receiver")]

      template(v-else-if="props.drip.percent")
        span #[addr.font-bold.mr-10(:address="props.drip.sender")] shares
        span <b>{{ props.drip.percent }}%</b> of incoming drips
        span with #[addr.font-bold.ml-10(:address="props.drip.receiver")]

    //- .w-full.flex.items-center.justify-between.text-violet-650.px-24
      template(v-if="props.drip.amount")
        span #[addr.font-bold(:address="props.drip.sender")] drips
        | <b>#[svg-dai.inline-block(style="height:0.8em; transform:translateY(-0.07em)")]{{ props.drip.amount }}/mo</b>
        span to #[addr.font-bold(:address="props.drip.receiver")]

      template(v-else-if="props.drip.percent")
        span #[addr.font-bold(:address="props.drip.sender")] shares
        | <b>{{ props.drip.percent }}% of incoming drips</b>
        span with #[addr.font-bold(:address="props.drip.receiver")]

    //- .w-full.flex.items-center.justify-center.text-violet-650
      div(v-if="props.drip.amount")
        | #[addr.font-bold(:address="props.drip.sender")] is dripping <b>{{ props.drip.amount }} DAI</b> every month to #[addr.font-bold(:address="props.drip.receiver")]

      div(v-if="props.drip.percent")
        | #[addr.font-bold(:address="props.drip.sender")] is instantly sharing <b>{{ props.drip.percent }}%</b> of incoming funds with #[addr.font-bold(:address="props.drip.receiver")]

    //- style 2
    //- .w-full.flex.justify-between.items-center.text-violet-650.text-md
      .ml-24
        addr.font-bold(:address="props.drip.sender")
      //- div
        //- template(v-if="props.drip.amount") drips <b>{{ props.drip.amount }} #[svg-dai.inline-block(style="height:0.8em; transform:translateY(-0.07em)")]/mo</b> to
        //- template(v-if="props.drip.amount") drips <b>{{ props.drip.amount }}</b> DAI/mo to
        template(v-if="props.drip.amount") drips <b>#[svg-dai.inline-block(style="height:0.8em; transform:translateY(-0.07em)")]{{ props.drip.amount }}/mo</b> to
        template(v-else-if="props.drip.percent") shares <b>{{ props.drip.percent }}% of drips</b> with
      .flex-1.w-full.flex.justify-evenly
        template(v-if="props.drip.amount")
          span drips
          <b>#[svg-dai.inline-block(style="height:0.8em; transform:translateY(-0.07em)")]{{ props.drip.amount }}/mo</b>
          span to
        template(v-else-if="props.drip.percent") shares <b>{{ props.drip.percent }}% of their drips</b> with
      .mr-8
        addr.font-bold(:address="props.drip.receiver")

  .h-80.w-80.flex.items-center.justify-center.bg-indigo-700.rounded-full.mr-2(:class="{'bg-indigo-800': altBg(drip) }")
    img.h-20(src="~@/assets/icons/arrow-right-violet.svg")

  //- receiver(s)
  router-link(:to="receiverRt")
    addresses-tag(:addresses="props.drip.receiver")
  //- router-link.h-80.flex.items-center.justify-endff.rounded-full.bg-indigo-700.px-12.w-260.border-2.border-transparent.notouch_hover_border-violet-600(:class="{'bg-indigo-800': altBg(drip) }", :to="receiverRt")
    //- (summary - "10 addresses")
    template(v-if="isMultiple")
      //- .w-full.text-center.font-bold {{ props.drip.receiver.length }} addresses
      ul.flex.w-full.justify-start.items-center.flex-row-reverse
        //- .flex-1

        li(v-for="(address, i) in props.drip.receiver.slice(0, 6)", :class="{'-ml-28': i < 5}")
          user-avatar.w-54.h-54(:address="address", blockieSize="54", :key="address")

        //- (extra count)
        template(v-if="props.drip.receiver.length - 6 > 0")
          .-ml-8.order-first.min-w-54.h-54.flex.items-center.justify-center.bg-indigo-950.rounded-full.font-semibold
            | +{{ props.drip.receiver.length - 6}}
    //- (single receiver)
    template(v-else)
      .flex-1.min-w-0.truncate.inline.mx-12.text-center
        .inline
          addr.font-bold.inline(:address="props.drip.receiver[0]", :youOn="true", :key="props.drip.receiver[0]")
      user-avatar.w-54.h-54(:address="props.drip.receiver[0]", blockieSize="54", :key="props.drip.receiver[0]")
</template>
