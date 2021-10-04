<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template lang="pug">
article.profile
  h1 {{ route.params.address }}
</template>
