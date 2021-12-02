<script setup>
import AvatarBlockie from '@/components/AvatarBlockie'
import Addr from '@/components/Addr'
import SvgDai from '@/components/SvgDai'
const props = defineProps(['drip'])
</script>

<template lang="pug">
.drip-row.flex.h-80.rounded-full.text-violet-650.text-md.relative
  //- drip icon
  //- .w-80.h-80.mr-2.flex.items-center.justify-center.bg-indigo-700.rounded-full
    //- img(src="~@/assets/icons/drip-row-icon.svg")
    span(style="font-size:1.8em") 💧

  router-link.h-80.flex.items-center.rounded-full.bg-indigo-700.px-16.mr-2.w-260.border-2.border-transparent.notouch_hover_border-violet-600(:class="{'bg-indigo-800': props.drip.percent }", :to="{name: 'user', params: { address: props.drip.sender }}")
    //- sender avatar / blockie
    avatar-blockie.w-44.h-44.flex-shrink-0(:address="props.drip.sender", width="44")

    .flex-1.min-w-0.truncate.inline.mx-12.text-center
      .inline
        addr.font-bold.inline(:address="props.drip.sender")

  //- drip icon
  .w-80.h-80.flex.items-center.justify-center.bg-indigo-700.rounded-full.mr-2(:class="{'bg-indigo-800': props.drip.percent }")
    //- img(src="~@/assets/icons/drip-row-icon.svg")
    span(style="font-size:1.75em") 💧

  .flex-1.flex.bg-indigo-700.rounded-full.px-20.mr-2(:class="{'bg-indigo-800': props.drip.percent }")

    .w-full.flex.items-center.justify-center
      template(v-if="props.drip.amount")
        //- span #[addr.font-bold(:address="props.drip.sender")]
        span <b>#[svg-dai.inline-block.mr-1(style="height:0.8em; transform:translateY(-0.07em)")]{{ props.drip.amount }}</b> every month
        //- span #[addr.font-bold(:address="props.drip.receiver")]

      template(v-else-if="props.drip.percent")
        //- span #[addr.font-bold(:address="props.drip.sender")]
        span <b>{{ props.drip.percent }}%</b> of incoming drips
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

  .h-80.w-80.flex.items-center.justify-center.bg-indigo-700.rounded-full.mr-2(:class="{'bg-indigo-800': props.drip.percent }")
    img.h-20(src="~@/assets/icons/arrow-right-violet.svg")

  //- receiver blockie
  router-link.h-80.flex.items-center.justify-end.rounded-full.bg-indigo-700.px-16.w-260.border-2.border-transparent.notouch_hover_border-violet-600(:class="{'bg-indigo-800': props.drip.percent }", :to="{name: 'user', params: { address: props.drip.receiver }}")
    .flex-1.min-w-0.truncate.inline.mx-12.text-center
      .inline
        addr.font-bold.inline(:address="props.drip.receiver")
    avatar-blockie.w-44(:address="props.drip.receiver", width="44")
</template>
