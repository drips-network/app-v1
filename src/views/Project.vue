<script>
let project
export default {
  name: 'Project',
  data () {
    return {
      project
    }
  },
  async beforeRouteEnter (to, from, next) {
    const resp = await fetch(`https://gateway.pinata.cloud/ipfs/${to.query.ipfs}`)
    project = await resp.json()
    next()
  }
}
</script>

<template lang="pug">
article.profile
  h1 name: {{ project.name }}
  p symbol: {{ project.symbol.toUpperCase() }}
  p descrip: {{ project.descrip }}
</template>
