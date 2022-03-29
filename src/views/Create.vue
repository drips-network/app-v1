<script setup>
import { ref, computed, watch } from 'vue'
import store from '@/store'
import { useRoute, useRouter } from 'vue-router'
import Panel from '@/components/Panel.vue'
const route = useRoute()
const router = useRouter()
const entryPanel = ref()

const onDripBtnClick = async () => {
  try {
    if (!store.state.address) await store.dispatch('connect')
    router.push({ name: 'user', params: { address: store.state.address } })
  } catch (e) {
    console.error(e)
    alert('You must connect a wallet to start dripping funds.')
  }
}

const isIndex = computed(() => route.name === 'create')
const childRoute = ref()
watch(route, (to) => {
  if (to.name === 'create') {
    entryPanel.value.open()
  } else {
    entryPanel.value.close()
    setTimeout(() => childRoute.value.scrollIntoView({ behavior: 'smooth' }), 200)
  }
})
</script>

<template lang="pug">
section.pt-72.px-10

  panel.mx-auto.transition.duration-200(ref="entryPanel", icon="☔️", label="Create Drips", :collapsed="!isIndex", :isEditable="false", @open="router.push({name: 'create' })", :class="{'opacity-30 notouch_hover_opacity-100 transition duration-150': !isIndex}")
    template(v-slot:header)
      h1.text-violet-650ff Create Drips

    //- TODO description/text about how some can't be edited later !!!
    //- p Now, set a monthly goal for your project and a minimum monthly amount for subscriptions.
    //- template(v-slot:description)
      p Raise funds by offering member tokens in a community or
      //- | <br>Fields in #[span.text-red-500.font-bold red] you cannot change later!

    //- funding options as tiles
    .flex.flex-wrap.-mx-10.mt-40
      .w-full.md_w-1x2.px-10.mb-20
        .aspect-w-5.aspect-h-4.md_aspect-w-1.md_aspect-h-1.relative.rounded-2xl.shadow-md-blue.border.border-transparent.notouch_hover_border-violet-500
          router-link.absolute.overlay.flex.items-center.justify-center(:to="{name: 'create-drips' }")
            div.pb-24
              div.text-2xl.mb-20 💧
              .text-xl.font-semibold.mb-16 Drip Monthly
              p.text-violet-600.px-10.leading-tight Stream DAI #[span.font-bold every month]<br>to any Ethereum address.

      .w-full.md_w-1x2.px-10.mb-20
        .aspect-w-5.aspect-h-4.md_aspect-w-1.md_aspect-h-1.relative.rounded-2xl.shadow-md-blue.border.border-transparent.notouch_hover_border-violet-500
          router-link.absolute.overlay.flex.items-center.justify-center(:to="{name: 'create-splits' }")
            div.pb-24
              div.text-3xl.mb-20 💦
              .text-xl.font-semibold.mb-16 Split your drips
              p.text-violet-600.px-20.leading-tight(style="max-widthff:15em") Split a #[b percent] of your incoming drips with any Ethereum address.

      .w-full.px-10
        .aspect-w-5.aspect-h-4.md_aspect-w-2.md_aspect-h-1.relative.rounded-2xl.shadow-md-blue.border.border-transparent.notouch_hover_border-violet-500
          router-link.absolute.overlay.flex.items-center.justify-center(:to="{name: 'create-community' }")
            div.pb-24
              div.text-3xl.mb-20 ⛲️
              .text-xl.font-semibold.mb-16 Create a Community
              p.mx-auto.text-violet-600.px-20.leading-tight(style="max-width:26em") Fund your community by issuing #[b memberships] and optionally #[b drip to others] every time you get paid.

  section.pt-24(ref="childRoute")
    router-view(:key="$route.path")

</template>
