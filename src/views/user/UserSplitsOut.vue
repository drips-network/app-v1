<script setup>
import { ref } from 'vue'
import IconSplits from '@/components/IconSplit'
import InfoBar from '@/components/InfoBar'
import Addr from '@/components/Addr'
import ModalSplitsAdd from '@/components/ModalSplitsAdd'

const splits = []

const modalSplitsOpen = ref(false)
</script>

<template lang="pug">
section.user-splits

  info-bar.mb-20.justify-center.px-32
    div
      template(v-if="$store.getters.isWalletAddr($route.params.address)") You are
      template(v-else) #[addr.font-bold(:address="$route.params.address")] is
      | &nbsp;<b>splitting</b> incoming funds with <b>{{ splits.length }} address{{ splits.length === 1 ? '' : 'es' }}</b>

  .mt-40
    button.btn.btn-lg.mx-auto.btn-violet.px-36(@click="modalSplitsOpen = true")
      | {{ splits.length ? 'Edit' : 'Add' }} Splits 💦

  modal-splits-add(v-if="modalSplitsOpen", :open="modalSplitsOpen", @close="modalSplitsOpen = false")
</template>
