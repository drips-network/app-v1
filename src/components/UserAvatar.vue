<script setup>
import { ref, computed, onMounted } from 'vue'
import store from '@/store'
import AvatarBlockie from '@/components/AvatarBlockie.vue'
import { ipfsUrl } from '@/utils'
const props = defineProps(['address', 'blockieSize'])

const imgSrc = ref()
const errorLoading = ref(false)

const onImgError = (e) => {
  // console.error(e)
  errorLoading.value = true
}

onMounted(() => {
  // get avatar image
  store.dispatch('profiles/getAvatar', { address: props.address })
    .then(value => {
      try {
        // try as normal url
        const url = new URL(value)
        imgSrc.value = url
      } catch (e) {
        // invalid url
        if (value?.length) {
          // try as ipfs url
          imgSrc.value = ipfsUrl(value)
        }
      }
    })
    .catch(e => {
      console.error(e)
      errorLoading.value = true
    })
})
</script>

<template lang="pug">
//- set size in parent
.user-avatar.rounded-full.overflow-hidden.relative.bg-indigo-950
  //- (custom ens image)
  template(v-if="imgSrc && !errorLoading")
    img.absolute.overlay.object-cover.object-center.transition.duration-150(:src="imgSrc", alt="Avatar Image", @error="onImgError")

  //- (blockie)
  template(v-else)
    avatar-blockie.w-full(:address="props.address", :width="blockieSize")

</template>
