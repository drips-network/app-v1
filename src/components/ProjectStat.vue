<script setup>
</script>

<template lang="pug">
.project-stat.bg-indigo-800.rounded-2xl.relative.text-base
  div(style="padding-bottom:101%")
    //- .aspect-w-1.aspect-h-1
    .absolute.overlay.flex.flex-col.w-full
      header.pt-20.px-20.font-semibold.text-violet-650
        slot(name="header")
      //- .flex-1.flex.items-center.justify-center.text-8xl.pb-32.text-violet-650.font-cheee
      .flex-1.flex.items-center.justify-center.text-6xl.pb-32.text-violet-650.font-sans.font-semibold
        slot
</template>
