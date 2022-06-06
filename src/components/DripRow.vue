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
const uniqueReceivers = computed(() => [...new Set(props.drip.receiver)])
</script>

<template lang="pug">
.drip-row.flex.flex-wrap.md_flex-wrap-none.text-violet-650.text-md.relative

  .flex.justify-center.w-full.md_w-auto
    router-link.h-80.flex.items-center.rounded-full.bg-indigo-700.px-12.mr-2.md_w-260.border-2.border-transparent.btn-focus-violet(:class="{'bg-indigo-800': altBg(drip) }", :to="{name: 'user', params: { address: props.drip.sender }}")
      //- sender avatar / blockie
      user-avatar.w-54.h-54.flex-shrink-0(:address="props.drip.sender", blockieSize="44", :key="props.drip.sender")

      flex-truncate.flex-1.mx-14.text-center
        addr.font-bold.inline(:address="props.drip.sender", :youOn="true", :key="props.drip.sender")

  .flex.justify-center.w-full.md_w-auto
    //- drip icon
    .w-80.h-80.flex.items-center.justify-center.md_bg-indigo-700.rounded-full.mr-2(:class="{'bg-indigo-800': altBg(drip) }")
      //- img(src="~@/assets/icons/drip-row-icon.svg")
      span(v-if="props.drip.percent", style="font-size:1.2em") 💦
      span(v-else, style="font-size:1.8em") 💧
      

  .hidden.md_flex.flex-1.h-80.items-center.justify-center.bg-indigo-700.rounded-full.px-20.mr-2.font-semibold(:class="['text-violet-650', {'bg-indigo-800': altBg(drip) }]")
      //- (stream)
      template(v-if="props.drip.amount")
        //- span #[addr.font-bold(:address="props.drip.sender")]
        span #[span.opacity-65 drips] #[span.text-violet-650 {{ props.drip.amount }}#[svg-dai.inline-block.ml-3.mr-1(style="height:0.8em; transform:translateY(-0.07em)")]] #[span.opacity-65 every month&nbsp;] #[span.text-black {{ props.drip.amount >= 100 ? '🎉' : '' }}]

      //- (split)
      template(v-else-if="props.drip.percent")
        span #[span.opacity-65 splits] #[span(:class="{'text-greenbright-400': props.drip.percent >= 100 }") {{ parseFloat(props.drip.percent.toFixed(0)) }}%] #[span.opacity-65 of incoming drips] #[span.text-black {{ props.drip.percent >= 100 ? '🔋' : props.drip.percent >= 60 ? '🌊' : props.drip.percent >= 40 ? '⛲️' : props.drip.percent >= 20 ? '🚿' : '' }}]
        //- span #[addr.font-bold(:address="props.drip.receiver")]
      
      //- (give)
      template(v-else-if="props.drip.give")
        //- span #[addr.font-bold(:address="props.drip.sender")]
        span dripped #[span.text-violet-650 #[svg-dai.inline-block.mr-1(style="height:0.9em; transform:translateY(-0.07em)")]{{ props.drip.give }}]
  
  //- (right arrow)
  .hidden.md_flex.h-80.w-80.items-center.justify-center.bg-indigo-700.rounded-full.mr-2(:class="{'bg-indigo-800': altBg(drip) }")
    img.h-20(src="~@/assets/icons/arrow-right-violet.svg")

  //- receiver(s)
  .flex.justify-center.w-full.md_w-auto
    //- TODO link to DripDetail view?
    router-link.md_w-256.btn-focus-violet.rounded-full(:to="receiverRt")
      addresses-tag(:addresses="uniqueReceivers")
  
</template>
