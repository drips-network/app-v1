<script setup>
import AvatarBlockie from '@/components/AvatarBlockie'
</script>

<template lang="pug">
article.profile.pb-80
  header.mt-40.px-36
    .flex
      .h-160.rounded-full.bg-indigo-700.flex.items-center
        avatar-blockie.w-112.mx-24(:address="$route.params.address", width="112")
        h1.text-2xl.font-semibold.pr-60 {{ $store.getters.addrShort($route.params.address) }}

    nav.my-40.flex
      router-link.btn.btn-dark.btn-active-white.btn-lg.w-180(:to="{ name: 'user', params: $route.params }") Projects
      router-link.btn.btn-dark.btn-active-white.btn-lg.w-180(:to="{ name: 'user-funds', params: $route.params }") Drips

  main#main
    router-view

</template>
