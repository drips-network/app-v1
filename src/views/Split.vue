<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import api, { querySplit as query } from '@/api'
import DripDetail from '@/components/DripDetail.vue'
import store from '@/store'

const drip = ref(undefined)
const route = useRoute()

const getSplit = async () => {
  try {
    const resp = await api({ query, variables: { id: route.params.id }  })
    const entry = resp.data.splitsEntry
    const percent = 
    drip.value = {
      ...entry,
      percent: Number((entry.weight / store.state.splitsFractionMax * 100).toFixed(2)).toLocaleString().replace('00$', '')
    }
  } catch (e) {
    console.error(e)
    drip.value = { error: e }
  }
}

getSplit()
</script>

<template lang="pug">
drip-detail(:drip="drip")
</template>