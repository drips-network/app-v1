<script setup>
import SvgDai from '@/components/SvgDai.vue'
import { toDAIPerMo } from '@/utils'
const props = defineProps(['drip', 'valueColor'])
const exact = (wei) => toDAI(wei, 'exact')
</script>

<template lang="pug">
.drip-description
  //- drip
  template(v-if="props.drip.amtPerSec")
    span #[span.inline-block(:class="props.valueColor") {{ toDAIPerMo(props.drip.amtPerSec) }} #[svg-dai.inline-block(style="height:0.8em; transform:translateY(-0.07em); margin-left: .25em")]/mo&nbsp;] #[span.text-black {{ toDAIPerMo(props.drip.amtPerSec, 'exact') >= 100 ? '🎉' : '' }}]

  //- split
  template(v-else-if="props.drip.percent")
    span(:class="{'text-greenbright-400': props.drip.percent >= 100 }") splits #[span.text-violet-650 {{ parseFloat(props.drip.percent.toFixed(0)) }}%] of incoming drips #[span.text-black {{ props.drip.percent >= 100 ? '🔋' : props.drip.percent >= 60 ? '🌊' : props.drip.percent >= 40 ? '⛲️' : props.drip.percent >= 20 ? '🚿' : '' }}]
    //- span #[addr.font-bold(:address="props.drip.receiver")]

  //- give
  template(v-else-if="props.drip.give")
    //- span #[addr.font-bold(:address="props.drip.sender")]
    span dripped #[span.text-violet-650 #[svg-dai.inline-block.mr-1(style="height:0.9em; transform:translateY(-0.07em)")]{{ props.drip.give }}]
</template>