<script setup>
import { ref, computed } from 'vue'
import store from '@/store'
import AvatarBlockie from '@/components/AvatarBlockie'
const props = defineProps(['address', 'blockieSize'])
const profile = computed(() => store.state.addresses[props.address.toLowerCase()]?.records || {})
const avatarImgError = ref(false)
</script>

<template lang="pug">
//- set size in parent
.user-avatar.rounded-full.overflow-hidden.relative
  //- (custom ens image)
  template(v-if="profile.avatar && !avatarImgError")
    img.absolute.overlay.object-cover.object-center.transition.duration-150(:src="profile.avatar", alt="Avatar Image", @error="avatarImgError = true")

  //- (blockie)
  template(v-else)
    avatar-blockie.w-full(:address="props.address", :width="blockieSize")

</template>
