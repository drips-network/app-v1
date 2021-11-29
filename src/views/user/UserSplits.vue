<script setup>
import IconSplits from '@/components/IconSplit'
</script>

<template lang="pug">
section.user-splits
  .flex.justify-center
    .mx-auto.bg-indigo-800.rounded-2xlb.py-24.px-32.text-md.text-violet-650 Share revenue with others with <b>Splits</b>.

  template(v-if="$store.state.address")
    .mt-40.flex.justify-center
      button.btn.btn-lg.btn-violet.px-36
        | Add Splits
        icon-splits

</template>
