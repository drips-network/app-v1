<script setup>
import { ref, computed, onMounted } from 'vue'
import store from '@/store'
import AvatarBlockie from '@/components/AvatarBlockie'
const props = defineProps(['address', 'blockieSize'])
const avatar = ref()
const avatarImgError = ref(false)
const onImgError = (e) => {
  console.error(e)
  avatarImgError.value = true
}
onMounted(() => {
  store.dispatch('profiles/getAvatar', { address: props.address })
    .then(src => avatar.value = src)
})
</script>

<template lang="pug">
//- set size in parent
.user-avatar.rounded-full.overflow-hidden.relative.bg-indigo-950
  //- (custom ens image)
  template(v-if="avatar && !avatarImgError")
    img.absolute.overlay.object-cover.object-center.transition.duration-150(:src="avatar", alt="Avatar Image", @error="onImgError")

  //- (blockie)
  template(v-else)
    avatar-blockie.w-full(:address="props.address", :width="blockieSize")

</template>
