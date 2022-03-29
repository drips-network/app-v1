<script setup>
import UserAvatar from '@/components/UserAvatar.vue'
const props = defineProps({
  addresses: { type: Array, default: () => ([]) },
  limit: { type: Number, default: 6 },
  height: { type: String, default: '54' }
})
const hasNegMargin = i => i < (Math.min(props.limit, props.addresses.length) - 1)
</script>

<template lang="pug">
//- list avatars in reverse so left most item is on top (natural z-index)
ul.flex.w-full.justify-start.items-center.flex-row-reverse
  //- avatars...
  li(v-for="(address, i) in props.addresses.slice(0, props.limit)", :style="{ marginLeft: hasNegMargin(i) ? `calc(-2.4rem * ${props.height} / 54)` : '' }")
    user-avatar.w-44.h-44(:address="address", :key="address")

  //- "+6" counter
  template(v-if="props.addresses.length - props.limit > 0")
    .-ml-11.order-first.flex.items-center.justify-center.bg-indigo-950.rounded-full.font-semibold(:style="{ minWidth: props.height + 'px', height: props.height + 'px' }")
      | +{{ props.addresses.length - limit}}
</template>