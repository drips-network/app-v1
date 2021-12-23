<script setup>
import store from '@/store'
import { useRouter } from 'vue-router'
import Panel from '@/components/Panel'
const router = useRouter()

const onDripBtnClick = async () => {
  try {
    if (!store.state.address) await store.dispatch('connect')
    router.push({ name: 'user', params: { address: store.state.address } })
  } catch (e) {
    console.error(e)
    alert('You must connect a wallet to start dripping funds.')
  }
}
</script>

<template lang="pug">
section.flex.w-full.items-center.justify-center.py-52

  panel.mx-auto.my-10(icon="☔️")
    template(v-slot:header)
      h1.text-violet-650ff Create Drips

    //- TODO description/text about how some can't be edited later !!!
    //- p Now, set a monthly goal for your project and a minimum monthly amount for subscriptions.
    //- template(v-slot:description)
      p Raise funds by offering member tokens in a community or
      //- | <br>Fields in #[span.text-red-500.font-bold red] you cannot change later!

    //- funding options as tiles
    .flex.-mx-10.mt-40.flex-row-reverse
      //- TODO convert to radio buttons for accessibility
      .w-1x2.px-10
        .aspect-w-1.aspect-h-1.relative.rounded-2xl.shadow-md-blue.border.border-transparent.notouch_hover_border-violet-500
          router-link.absolute.overlay.flex.items-center.justify-center(:to="{name: 'create-community' }")
            div.pb-24
              div.text-3xl.mb-20 ✨
              .text-xl.font-semibold.mb-16 Create a Community
              p.text-violet-600.px-10.leading-tight Fund your community by selling #[span.font-bold member tokens] or offering #[span.font-bold subscriptions].
          //- circle
          //- .m-20.h-32.w-32.border.border-violet-700.rounded-full.p-3.flex
            .rounded-full.w-full(:class="{'bg-violet-700': isSubscription}")

      .w-1x2.px-10
        .aspect-w-1.aspect-h-1.relative.rounded-2xl.shadow-md-blue.border.border-transparent.notouch_hover_border-violet-500
          router-link.absolute.overlay.flex.items-center.justify-center(:to="{name: 'create-drips' }")
            div.pb-24
              div.text-2xl.mb-20 💧
              .text-xl.font-semibold.mb-16 Drip to Others
              p.text-violet-600.px-10.leading-tight Drip funds #[span.font-bold every month] or #[span.font-bold share&nbsp;a&nbsp;percent] of your incoming funds with anyone.
          //- circle
          //- .m-20.h-32.w-32.border.border-violet-700.rounded-full.p-3.flex
            .rounded-full.w-full(:class="{'bg-violet-700': !isSubscription}")

//- section.flex.w-full.items-center.justify-center
  .flex.flex-col.items-center
      div
        router-link.btn.btn-xl.btn-indigo.px-48(:to="{name: 'create-community' }") Create a Community ✨
      div.mt-10
        button.btn.btn-xl.btn-indigo.px-56(@click="onDripBtnClick") Drip funds 💧
</template>
