<template lang="pug">
article.legal-page.pt-72.px-10.pb-120
  .w-full.mx-auto.max-w-6xl
    header.text-center
      h1.text-2xl.font-bold.text-violet-650
        slot(name="title")

    section.mt-56.children-mt-em.text-lg.leading-normal.md_text-base.md_leading-normal
      slot
</template>

<script setup>
</script>

<style>
.legal-page {
  & h2, & h3, & h4, & a{
    @apply font-bold;
  }

  & a{
    @apply text-violet-650;
  }

  & h2, & h3{
    margin-top:1.75em;
  }

  & h2 {
    @apply text-xl
  }

  & h3 {
    @apply text-md
  }

  & ul, & ol{
    @apply pl-40;
  }

  & ol{
    list-style-type: numeric;
  }
  & ul{
    list-style-type: disc;
  }
}
</style>