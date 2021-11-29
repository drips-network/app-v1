<script setup>
// TODO - beforeRouteEnter() redirect if address is a project!
import AvatarBlockie from '@/components/AvatarBlockie'
import Addr from '@/components/Addr'
</script>

<template lang="pug">
article.profile.pb-80
  header.mt-40.px-36
    .flex.items-endff.items-center.justify-between.w-full
      //- user tag
      .h-160.rounded-full.bg-indigo-700.flex.items-center
        avatar-blockie.w-112.mx-24(:address="$route.params.address", width="112")
        h1.text-2xl.font-semibold.pr-60
          template(v-if="$route.params.address === $store.state.address") You
          template(v-else)
            addr(:address="$route.params.address")
      //-
      //- button.ml-12.btn.btn-mdd.btn-outline.font-semibold.text-md.px-32 Fund&nbsp; 🌈
      template(v-if="$route.params.address !== $store.state.address")
        button.btn.btn-lg.btn-white.font-semibold.text-md.pl-36.pr-32 Fund&nbsp; 🌈

    nav.my-40.flex
      router-link.btn.btn-dark.btn-active-violet.btn-lg.px-36(:to="{ name: 'user', params: $route.params }") Projects
      router-link.btn.btn-dark.btn-active-violet.btn-lg.px-40(:to="{ name: 'user-drips', params: $route.params }") Member Of
      router-link.btn.btn-dark.btn-active-violet.btn-lg.px-40(:to="{ name: 'user-splits', params: $route.params }") Splits

  main#main
    router-view

</template>
