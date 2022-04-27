<script setup>
import { reactive } from 'vue'
import InputBody from '@/components/InputBody.vue'

const props = defineProps({
  membership: Object
})

const data = reactive({
  name: '',
  minDAI: '',
  perks: ['']
})
</script>

<template lang="pug">
.membership-input-group.rounded-2xl.bg-indigo-800.p-12
  .flex.-mx-5
    .w-1x2.px-5
      input-body
        input(v-model="data.name")
    .w-1x2.px-5
      input-body
        input(v-model="data.name")

  .mt-10
    .relative(v-for="perk in perks")
      input-body
        input(v-model="perk")
</template>
