<script setup>
import UserAvatar from '@/components/UserAvatar.vue'
import Addr from '@/components/Addr.vue'
const props = defineProps(['addresses', 'avatarsOnly'])
</script>

<template lang="pug">
.addresses-tag.h-80.flex.items-center.justify-endff.rounded-full.bg-indigo-700.px-12
  //- (summary - "10 addresses")
  template(v-if="props.addresses.length > 1 || props.avatarsOnly")
    //- .w-full.text-center.font-bold {{ props.drip.receiver.length }} addresses
    ul.flex.w-full.justify-start.items-center.flex-row-reverse(:class="{'ml-28': props.addresses.length < 6}")
      //- .flex-1

      li(v-for="(address, i) in props.addresses.slice(0, 6)", :class="{'-ml-28': i < 5}")
        user-avatar.w-54.h-54(:address="address", blockieSize="54", :key="address")

      template(v-if="props.addresses.length - 6 > 0")
        .-ml-8.order-first.min-w-54.h-54.flex.items-center.justify-center.bg-indigo-950.rounded-full.font-semibold
          | +{{ props.addresses.length - 6}}
  //- (single receiver)
  template(v-else-if="props.addresses.length === 1 && !props.avatarsOnly")
    .flex-1.min-w-0.truncate.inline.mx-12.text-center
      .inline
        addr.font-bold.inline(:address="props.addresses[0]", :youOn="true", :key="props.addresses[0]")
    user-avatar.w-54.h-54(:address="props.addresses[0]", blockieSize="54", :key="props.addresses[0]")
</template>