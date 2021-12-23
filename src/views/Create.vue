<script setup>
import { ref, computed, watch } from 'vue'
import store from '@/store'
import { useRoute, useRouter } from 'vue-router'
import Panel from '@/components/Panel'
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
section.py-72

  panel.mx-auto.transition.duration-200(ref="entryPanel", icon="☔️", label="Create Drips", :collapsed="!isIndex", :isEditable="false", @open="router.push({name: 'create' })", :class="{'opacity-30 notouch_hover_opacity-100 transition duration-150': !isIndex}")
    template(v-slot:header)
      h1.text-violet-650ff Create Drips

    //- TODO description/text about how some can't be edited later !!!
    //- p Now, set a monthly goal for your project and a minimum monthly amount for subscriptions.
    //- template(v-slot:description)
      p Raise funds by offering member tokens in a community or
      //- | <br>Fields in #[span.text-red-500.font-bold red] you cannot change later!

    //- funding options as tiles
    .flex.-mx-10.mt-40
      .w-1x2.px-10
        .aspect-w-1.aspect-h-1.relative.rounded-2xl.shadow-md-blue.border.border-transparent.notouch_hover_border-violet-500
          router-link.absolute.overlay.flex.items-center.justify-center(:to="{name: 'create-drips' }")
            div.pb-24
              div.text-2xl.mb-20 💧
              .text-xl.font-semibold.mb-16 Drip to Others
              p.text-violet-600.px-10.leading-tight Drip funds #[span.font-bold every month] or #[span.font-bold share&nbsp;a&nbsp;percent] of your incoming drips with anyone.

      .w-1x2.px-10
        .aspect-w-1.aspect-h-1.relative.rounded-2xl.shadow-md-blue.border.border-transparent.notouch_hover_border-violet-500
          router-link.absolute.overlay.flex.items-center.justify-center(:to="{name: 'create-community' }")
            div.pb-24
              div.text-3xl.mb-20 ✨
              .text-xl.font-semibold.mb-16 Create a Community
              p.text-violet-600.px-10.leading-tight Fund your community by selling #[span.font-bold member tokens] or offering #[span.font-bold subscriptions].

  section.pt-24(ref="childRoute")
    router-view(:key="$route.path")

</template>
