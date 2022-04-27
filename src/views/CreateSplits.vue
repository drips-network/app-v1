<script setup>
import Panel from '@/components/Panel.vue'
import PanelSplitsEdit from '@/components/PanelSplitsEdit.vue'
import store from '@/store'
import { useRouter } from 'vue-router'

const connect = async () => {
  try {
    await store.dispatch('connect')
    setType()
  } catch (e) {
    console.error(e)
  }
}

const router = useRouter()
const goToMySplits = () => router.push({ name: 'user-drips-out', params: { address: store.state.address } })
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
  panel-splits-edit.mx-auto(@viewSplits="goToMySplits")
    template(v-slot:header)
      h2 Split your Drips
    template(v-slot:description)
      p.mx-auto(style="max-width:22em")
        | Anytime you receive drips, they will be #[b split] with the addresses below:

</template>
