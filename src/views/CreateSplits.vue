<script setup>
import Panel from '@/components/Panel'
import PanelSplitsEdit from '@/components/PanelSplitsEdit'
import store from '@/store'

const connect = async () => {
  try {
    await store.dispatch('connect')
    setType()
  } catch (e) {
    console.error(e)
  }
}
</script>

<template lang="pug">
//- (connect btn panel)
template(v-if="!$store.state.address")
  panel.mx-auto(icon="⚡️")
    template(v-slot:header)
      h2 Connect your Wallet
    template(v-slot:description)
      p.text-violet-650 First connect your Ethereum Wallet to start #[b sharing your drips].
    button.mt-40.btn.btn-lg.btn-violet.mx-auto.px-36(ref="connectBtn", @click.prevent="connect") Connect

//- (edit splits panel)
template(v-else)
  panel-splits-edit.mx-auto

</template>
