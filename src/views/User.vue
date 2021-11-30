<script setup>
// TODO - beforeRouteEnter() redirect if address is a project!
import AvatarBlockie from '@/components/AvatarBlockie'
import Addr from '@/components/Addr'
</script>

<template lang="pug">
article.profile.pb-80
  header.mt-52.px-36
    .flex.items-endff.items-center.justify-between.w-full
      //- user tag
      .h-160.rounded-full.bg-indigo-700.flex.items-center
        avatar-blockie.w-112.mx-24(:address="$route.params.address", width="112")
        h1.text-2xl.font-bold.pr-60
          template(v-if="$route.params.address === $store.state.address") You
          template(v-else)
            addr(:address="$route.params.address")
      //-
      //- button.ml-12.btn.btn-mdd.btn-outline.font-semibold.text-md.px-32 Fund&nbsp; 🌈
      template(v-if="$route.params.address !== $store.state.address")
        button.btn.btn-lg.btn-white.font-semibold.text-md.pl-36.pr-32 Drip to 0x... 💧

    nav.mt-52.mb-32
      .flex.items-start
        .h-80.rounded-full.flex.items-center.px-7.bg-indigo-700
          router-link.btn.btn-active-violet.btn-mdd.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-in-projects', params: $route.params }", :class="{'bg-violet-600': $route.name.includes('user-in')}") In
          router-link.btn.btn-active-violet.btn-mdd.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-out-memberships', params: $route.params }", :class="{'bg-violet-600': $route.name.includes('user-out')}") Out
          //- router-link.btn.btn-active-violet.btn-mdd.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-drips-splits', params: $route.params }") Splits

        //- .h-64.rounded-full.flex.items-center.px-8.border.border-violet-700
          router-link.btn.btn-active-violet.btn-sm.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user', params: $route.params }", ) Memberships
          router-link.btn.btn-active-violet.btn-sm.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-drips', params: $route.params }") Splits

        //- (incoming submenu)
        template(v-if="$route.name.includes('user-in')")
          //- horizontal stem
          .w-40.h-40.border-b-2.border-indigo-700
          //- submenu body
          .h-80.rounded-full.flex.items-center.px-7.bg-indigo-700
            router-link.btn.btn-active-violet.btn-mdd.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-in-projects', params: $route.params }", ) Projects
            router-link.btn.btn-active-violet.btn-mdd.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-in-drips', params: $route.params }", ) Drips
            //- router-link.btn.btn-active-violet.btn-mdd.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-drips-splits', params: $route.params }") Splits

        //- (outoing submenu)
        template(v-if="$route.name.includes('user-out')")
          //- horizontal stem
          .w-40.h-40.border-b-2.border-indigo-700
          //- submenu body
          .h-80.rounded-full.flex.items-center.px-7.bg-indigo-700
            router-link.btn.btn-active-violet.btn-mdd.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-out-memberships', params: $route.params }", ) Memberships
            router-link.btn.btn-active-violet.btn-mdd.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-out-drips', params: $route.params }", ) Drips
            router-link.btn.btn-active-violet.btn-mdd.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-out-splits', params: $route.params }") Splits
            //- router-link.btn.btn-active-violet.btn-mdd.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-drips-splits', params: $route.params }") Splits

      //- .flex.mt-2(v-if="$route.name.includes('user-drips')")
        router-link.btn.btn-dark.btn-active-violet.btn-lg.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-drips', params: $route.params }") Direct
        router-link.btn.btn-dark.btn-active-violet.btn-lg.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-drips-splits', params: $route.params }") Memberships
        router-link.btn.btn-dark.btn-active-violet.btn-lg.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-drips-splits', params: $route.params }") Splits
      //- router-link.btn.btn-dark.btn-active-violet.btn-mdd.font-semibold.text-lg.px-32.mr-2(:to="{ name: 'user-splits', params: $route.params }") Splits

  main#main
    //- nav.pt-28.mb-28.flex.justify-center
      .max-w-full.flex.bg-indigo-900.rounded-full.p-8
        //- button Drips
        button.btn.btn-sm.px-20.font-semibold.text-md.btn-violet.mx-2 Memberships
        button.btn.btn-sm.px-20.font-semibold.text-md.btn-viffolet.mx-2 Splits

    router-view

</template>
