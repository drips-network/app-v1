<script setup>
// TODO - beforeRouteEnter() redirect if address is a project!
import { ref } from 'vue'
import AvatarBlockie from '@/components/AvatarBlockie'
import Addr from '@/components/Addr'
import IconSplit from '@/components/IconSplit'
import ModalDripTo from '@/components/ModalDripTo'

const dripModalOpen = ref(false)
</script>

<template lang="pug">
article.profile.pb-80
  header.mt-52.px-36
    .flex.items-endff.items-center.justify-between.w-full
      //- user tag
      .h-160.rounded-full.bg-indigo-700.flex.items-center
        avatar-blockie.w-112.mx-24.mr-36(:address="$route.params.address", width="112")
        h1.text-2xl.font-bold.pr-60
          template(v-if="$route.params.address === $store.state.address") You
          template(v-else)
            addr(:address="$route.params.address")

      //- (drip-to btn)
      template(v-if="!$store.getters.isWalletAddr($route.params.address)")
        button.btn.btn-lg.btn-white.font-semibold.text-md.pl-36.pr-32.text-xl(@click="dripModalOpen = true") Drip to 0x... 💧

    nav.mt-52.mb-20
      .flex.items-start.justify-between.text-violet-650
        .flex.tracking-wide
          router-link.h-80.btn.btn-indigo.btn-active-violet.font-semibold.text-lg.pl-28.pr-36.mr-2(:to="{ name: 'user-communities', params: $route.params }", :class="{'btn-violet': $route.name.includes('user-communities') }")
            span.mr-14.-ml-4(style="font-size:1.23em") 🙂
            | Communities
          router-link.h-80.btn.btn-indigo.btn-active-violet.font-semibold.text-lg.pl-28.pr-36.mr-2(:to="{ name: 'user-drips', params: $route.params }", :class="{'btn-violet': $route.name.includes('user-drips') }")
            span.mr-14.-ml-5(style="font-size:1.18em") 💧
            | Drips

        //- (communities submenu)
        template(v-if="$route.name.includes('user-communities')")
          .h-80.rounded-full.flex.items-center.px-7.bg-indigo-700
            router-link.btn.btn-active-violet.btn-mdd.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-communities', params: $route.params }") Created
            router-link.btn.btn-active-violet.btn-mdd.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-communities-joined', params: $route.params }") Joined

        //- (drips submenu)
        template(v-if="$route.name.includes('user-drips')")
          //- horizontal stem
          //- .w-40.h-40.border-b-2.border-indigo-700
          //- submenu body
          .h-80.rounded-full.flex.items-center.px-7.bg-indigo-700
            router-link.btn.btn-active-violet.btn-mdd.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-drips-in', params: $route.params }", ) In
            router-link.btn.btn-active-violet.btn-mdd.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-drips-out', params: $route.params }", ) Out

  main#main.px-36.min-h-screen

    router-view(:key="$route.path")

  //- modals
  modal-drip-to(v-if="dripModalOpen", :address="$route.params.address", :open="dripModalOpen", @close="dripModalOpen = false")

</template>
