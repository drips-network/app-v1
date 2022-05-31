<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import api, { queryGive as query } from '@/api'
import DripDetail from '@/components/DripDetail.vue'

const drip = ref(undefined)
const route = useRoute()

const getDrip = async () => {
  try {
    const resp = await api({ query, variables: { id: route.params.id }  })
    drip.value = resp.data.give
  } catch (e) {
    console.error(e)
    drip.value = { error: e }
  }
}

getDrip()
</script>

<template lang="pug">
drip-detail(:drip="drip")
</template>