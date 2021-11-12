<script setup>
import { ref, toRaw, computed, reactive } from 'vue'
import Panel from '@/components/Panel'
import InputBody from '@/components/InputBody'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle'
import store, { pinImageToIPFS } from '@/store'

const owner = computed(() => store.state.address)

const project = reactive({
  name: '',
  // owner - added in save
  symbol: '',
  descrip: '',
  image: null,
  website: '',
  twitter: '',
  discord: '',
  radicleProjectId: '',
  githubProject: ''
})

const emit = defineEmits(['projectMetaUpdated'])

async function save () {
  let body = toRaw(project)
  body = { owner: owner.value, ...body }
  emit('projectMetaUpdated', body)
}

const imgSrc = ref('')
const onImgFileChange = (e) => {
  const input = e.target
  if (input.files && input.files[0]) {
    var reader = new FileReader()
    reader.onload = async function (event) {
      imgSrc.value = event.target.result

      // upload to ipfs
      // TODO: upload only on create() to save ipfs uploads
      try {
        let resp = await pinImageToIPFS(imgSrc.value)
        resp = await resp.json()
        // oops
        if (resp.error) {
          throw new Error(resp.message)
        }
        // save
        project.image = resp.IpfsHash
      } catch (e) {
        console.error(e)
        alert('An error occured. Perhaps the image is too large (200kb max)')
        imgSrc.value = null
      }
    }
    reader.readAsDataURL(input.files[0])
  }
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
      //- avatar image upload
      .h-144.w-144.mx-auto.relative.rounded-full.overflow-hidden.bg-indigo-700.mb-36
        label.absolute.overlay.flex.items-center.justify-center.cursor-pointer(title="Project Image")
          span.sr-only Project Image
          input.hidden(type="file", accept=".png,.jpeg,.jpg", @change="onImgFileChange")
          svg-plus-minus-radicle
        //- (image)
        img.absolute.overlay.object-cover.pointer-events-none(v-if="imgSrc", :src="imgSrc", alt="your project image")

      form(@submit.prevent="save", validate)
        //- .my-10
          input-body(label="Owner", :isFilled="owner.length", format="code")
            input(v-model="owner", placeholder="owner", disabled)
        .my-10
          input-body(label="Name*", :isFilled="project.name.length")
            input(v-model="project.name", placeholder="Name*", required)
        .my-10
          input-body(label="Symbol*", :isFilled="project.symbol.length")
            input(v-model="project.symbol", placeholder="Symbol*", required)
        .my-10
          input-body(label="Description", :isFilled="project.descrip.length")
            input(v-model="project.descrip", placeholder="Description")
        .my-10
          input-body(label="Website", :isFilled="project.website.length", format="code")
            input(v-model="project.website", placeholder="Website", type="url")

        .my-10.flex.-mx-10
          .px-5
            input-body(label="Twitter", :isFilled="project.twitter.length")
              input(v-model="project.twitter", placeholder="Twitter")
          .px-5
            input-body(label="Discord", :isFilled="project.discord.length")
              input(v-model="project.discord", placeholder="Discord")

        .my-10
          input-body(label="Radicle Project ID", :isFilled="project.radicleProjectId.length", format="code")
            input(v-model="project.radicleProjectId", placeholder="Radicle Project ID")

        .my-10
          input-body(label="Github Project URL", :isFilled="project.githubProject.length", format="code")
            input(v-model="project.githubProject", placeholder="Github Project URL", type="url")

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
