<script setup>
import IconSplits from '@/components/IconSplit'
</script>

<template lang="pug">
section.user-splits.mx-40
  .border.border-violet-700.rounded-full.text-md.text-violet-650

    template(v-if="$store.state.address && $route.params.address === $store.state.address")
      .h-80.flex.items-center.justify-between
        .ml-32 <b>Split</b> revenue with others...

        .flex.justify-center.mr-12
          button.btn.btn-md.text-white.btn-violet.pl-24.pr-16.font-semibold
            | Add Splits
            .ml-8
              icon-splits

    template(v-else)
      .h-80.flex.items-center.justify-center
        | These addresses are splitting funds with 0x...
        br
        | These addresses are dripping funds to you directly.
        //- | This user is not splitting any revenue.

</template>
