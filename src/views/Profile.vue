<script setup>
import AvatarBlockie from '@/components/AvatarBlockie'
import UserNft from '@/components/UserNFT'
</script>

<template lang="pug">
article.profile.pb-80
  header.mt-40.px-36
    .flex
      .h-160.rounded-full.bg-indigo-700.flex.items-center
        avatar-blockie.w-112.mx-24(:address="$route.params.address", width="112")
        h1.text-2xl.font-semibold.pr-60 {{ $store.getters.addrShort($route.params.address) }}

    nav.my-40.flex
      .btn.btn-dark.btn-lg.w-180 Projects
      .btn.btn-lg.btn-white.w-180 Funds

  main#main
    section
      ul.flex.flex-wrap.px-20.w-full
        li.px-20.w-1x2
          user-nft(:nft="$route.query")
</template>
