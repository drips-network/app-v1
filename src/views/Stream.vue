<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import api, { queryDrip as query } from '@/api'
import DripDetail from '@/components/DripDetail.vue'

const drip = ref(undefined)
const route = useRoute()

const getDrip = async () => {
  try {
    const resp = await api({ query, variables: { id: route.params.id }  })
    drip.value = resp.data.dripsEntry
  } catch (e) {
    console.error(e)
    drip.value = { error: e }
  }
}

getDrip()
</script>

<template lang="pug">
article.stream
  drip-detail(:drip="drip")
</template>