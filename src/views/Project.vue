<script>
let project
export default {
  name: 'Project',
  data () {
    return {
      project
    }
  },
  computed: {
    projectAddress () {
      return this.$route.params.address
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
  p
    a(:href="`https://rinkeby.etherscan.io/address/${this.projectAddress}`", target="blank") Etherscan ↗
</template>
