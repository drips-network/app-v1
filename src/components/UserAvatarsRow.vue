<script setup>
import UserAvatar from '@/components/UserAvatar'
const props = defineProps({
  addresses: { type: Array, default: () => ([]) },
  limit: { type: Number, default: 6 }
})
</script>

<template lang="pug">
ul.flex.w-full.justify-start.items-center.flex-row-reverse
  //- avatars...
  li(v-for="(address, i) in props.addresses.slice(0, limit)", :class="{'-ml-30': i < (limit - 1)}")
    user-avatar.w-54.h-54(:address="address", blockieSize="54", :key="address")

  //- "+6" counter
  template(v-if="props.addresses.length - limit > 0")
    .-ml-11.order-first.min-w-54.h-54.flex.items-center.justify-center.bg-indigo-950.rounded-full.font-semibold
      | +{{ props.addresses.length - limit}}
</template>