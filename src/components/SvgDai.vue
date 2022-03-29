<script setup>
import { ref } from 'vue'
const props = defineProps({
  size: { type: String, default: undefined }
})
const usd = ref(false)
let height
let fz
switch (props.size) {
  case 'xs': height = 'h-14'; break
  case 'sm': height = 'h-16'; break // fz = { fontSize: '1.6mre' }; break
  case 'md': height = 'h-18'; break // fz = { fontSize: '1.8mre' }; break
  case 'lg': height = 'h-20'; break // fz = { fontSize: '1.6mre' }; break
  case 'lgg': height = 'h-22'; break // fz = { fontSize: '1.6mre' }; break
  case 'xl': height = 'h-28'; break // fz = { fontSize: '1.6mre' }; break
  case '2xl': height = 'h-32'; break // fz = { fontSize: '1.6mre' }; break
}
</script>

<template lang="pug">
//- span.font-semibold(v-show="usd", :style="fz", @click="usd = false") $
<svg v-show="!usd" :class="height" viewBox="0 0 27 25" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
<path fill-rule="evenodd" clip-rule="evenodd" d="M22.8018 11.4858C22.8018 5.39262 17.7525 0.453125 11.5239 0.453125H8.05383C6.13736 0.453125 4.58374 1.97296 4.58374 3.84778V4.69582C4.58374 5.63323 5.36055 6.39315 6.31879 6.39315C7.27703 6.39315 8.05383 5.63323 8.05383 4.69582V3.84778H11.5239C15.836 3.84778 19.3317 7.26744 19.3317 11.4858V13.1817C19.3317 17.4001 15.836 20.8198 11.5239 20.8198H8.05383V20.3626C8.05383 19.4252 7.27703 18.6653 6.31879 18.6653C5.36055 18.6653 4.58374 19.4252 4.58374 20.3626V20.8198C4.58374 22.6946 6.13735 24.2144 8.05383 24.2144H11.5239C17.7525 24.2144 22.8018 19.2749 22.8018 13.1817V11.4858ZM6.31879 12.0488C5.36055 12.0488 4.58374 12.8087 4.58374 13.7461V15.7276C4.58374 16.6651 5.36055 17.425 6.31879 17.425C7.27703 17.425 8.05383 16.6651 8.05383 15.7276V13.7461C8.05383 12.8087 7.27703 12.0488 6.31879 12.0488Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M26.2725 8.93854C26.2725 8.00113 25.4957 7.24121 24.5374 7.24121H1.98183C1.02359 7.24121 0.246788 8.00113 0.246788 8.93854C0.246788 9.87595 1.02359 10.6359 1.98183 10.6359H24.5374C25.4957 10.6359 26.2725 9.87595 26.2725 8.93854ZM26.2725 15.7278C26.2725 14.7904 25.4957 14.0305 24.5374 14.0305H1.98183C1.02359 14.0305 0.246788 14.7904 0.246788 15.7278C0.246788 16.6653 1.02359 17.4252 1.98183 17.4252H24.5374C25.4957 17.4252 26.2725 16.6653 26.2725 15.7278Z" fill="currentColor"/>
</svg>
</template>
