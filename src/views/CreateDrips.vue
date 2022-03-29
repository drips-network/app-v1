<script setup>
import Panel from '@/components/Panel.vue'
import PanelDripsEdit from '@/components/PanelDripsEdit.vue'
import store from '@/store'

const connect = async () => {
  try {
    await store.dispatch('connect')
  } catch (e) {
    console.error(e)
  }
}
</script>

<template lang="pug">
//- (connect wallet panel)
template(v-if="!$store.state.address")
  panel.mx-auto(icon="⚡️")
    template(v-slot:header)
      h2 Connect your Wallet
    template(v-slot:description)
      p.text-violet-650 First connect your Ethereum Wallet to #[b drip monthly].
    button.mt-40.btn.btn-lg.btn-violet.mx-auto.px-36(@click.prevent="connect") Connect

//- (edit drips panel)
template(v-else)
  panel-drips-edit.mx-auto
    template(v-slot:header)
      h2.leading-snug Drip Monthly
    template(v-slot:description)
      p.text-violet-650.mx-auto.leading-relaxed(style="max-widthff:26em")
        | Who do you want to send DAI to #[b every month]?

</template>
