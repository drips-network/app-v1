<script setup>
import { ref, toRaw, computed, reactive } from 'vue'
import Panel from '@/components/Panel'
import InputBody from '@/components/InputBody'
import store from '@/store'

const owner = computed(() => store.state.address)

const project = reactive({
  name: '',
  // owner - added in save
  symbol: '',
  descrip: ''
})

const emit = defineEmits(['projectMetaUpdated'])

async function save () {
  let body = toRaw(project)
  body = { owner: owner.value, ...body }
  emit('projectMetaUpdated', body)
}
</script>

<template lang="pug">
panel.mx-auto(icon="✨")
  template(v-slot:header)
    h2 Project
  section
    //- (connect bt)
    template(v-if="!owner")
      button.btn.btn-lg.btn-white.mx-auto(@click="$store.dispatch('connect')") Connect Wallet

    //- (create form)
    template(v-else)
      form(@submit.prevent="save", validate)
        //- .my-10
          input-body(label="Owner", :isFilled="owner.length", format="code")
            input(v-model="owner", placeholder="owner", disabled)
        .my-10
          input-body(label="Name*", :isFilled="project.name.length")
            input(v-model="project.name", placeholder="Name*", required)
        .my-10
          input-body(label="Symbol*", :isFilled="project.name.length")
            input(v-model="project.symbol", placeholder="Symbol*", required)
        .my-10
          input-body(label="Description", :isFilled="project.descrip.length")
            input(v-model="project.descrip", placeholder="Description")

        div.mt-40
          //- create btn
          button.btn.btn-lg.btn-indigo.mx-auto.min-w-sm(type="submit")
            | Next
            //- template(v-if="state.projectAddress") Saved!
            //- template(v-else-if="state.tx") Saving...
            //- template(v-else) Save

          //- (tx link)
          //- .mt-16.text-violet-600(v-if="state.tx")
            a(:href="`https://rinkeby.etherscan.io/tx/${state.tx.hash}`", target="_blank", rel="noopener noreferrer") View Tx on Etherscan ↗

//- .mt-4(v-if="state.projectAddress")
  router-link(:to="{name: 'project', params: { address: state.projectAddress }}") View Project

//- div
  button(@click="$store.dispatch('getEventLog')") Log Projects in Console...

</template>

<style>
</style>
