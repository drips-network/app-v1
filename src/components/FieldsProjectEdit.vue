<script setup>
import { ref, toRaw } from 'vue'
import InputBody from '@/components/InputBody'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle'
import { pinImageToIPFS } from '@/store'
import { ipfsUrl } from '@/utils'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

// current image ?
const imgSrcCurrent = props.modelValue.image ? ipfsUrl(props.modelValue.image) : undefined

const imgSrc = ref(imgSrcCurrent)

// TODO - handle on submit ?
const onImgFileChange = (e) => {
  const input = e.target
  if (input.files && input.files[0]) {
    var reader = new FileReader()
    reader.onload = async function (event) {
      imgSrc.value = event.target.result

      // upload to ipfs
      // TODO: upload only on create() to save ipfs uploads...
      try {
        let resp = await pinImageToIPFS(imgSrc.value)
        resp = await resp.json()
        // oops
        if (resp.error) {
          throw new Error(resp.message)
        }
        // save
        const clone = toRaw(props.modelValue)
        clone.image = resp.IpfsHash
        emit('update:modelValue', clone)
        return true
      } catch (e) {
        console.error(e)
        alert('Image upload error. Perhaps the image is too large (200kb max) or the request timed out and you may try again.')
        // revert img to current / empty
        imgSrc.value = imgSrcCurrent
      }
    }
    reader.readAsDataURL(input.files[0])
  }
}

</script>

<template lang="pug">
//- avatar image upload
.h-144.w-144.mx-auto.relative.rounded-full.overflow-hidden.bg-indigo-700.mb-36
  label.absolute.overlay.flex.items-center.justify-center.cursor-pointer(tabindex="0", title="Project Image")
    span.sr-only Project Image
    input.hidden(type="file", accept=".png,.jpeg,.jpg", @change="onImgFileChange")
    svg-plus-minus-radicle
  //- (image)
  img.absolute.overlay.object-cover.pointer-events-none(v-if="imgSrc", :src="imgSrc", alt="your project image")

//- form(@submit.prevent="save", validate)
section
  //- .my-10
    input-body(label="Owner", :isFilled="owner.length", format="code")
      input(v-model="owner", placeholder="owner", disabled)
  .my-10
    input-body(label="Name*", :isFilled="modelValue.name.length")
      input(v-model="modelValue.name", placeholder="Name*", required, autocomplete="new-password")
  .my-10
    //- TODO: format/validate symbol text?
    input-body(label="Symbol*", :isFilled="modelValue.symbol.length")
      input(v-model="modelValue.symbol", placeholder="Symbol*", required)
  .my-10
    //- TODO: use textarea
    input-body(label="Description", :isFilled="modelValue.descrip.length")
      input(v-model="modelValue.descrip", placeholder="Description")
  .my-10
    input-body(label="Website", :isFilled="modelValue.website.length", format="code")
      input(v-model="modelValue.website", placeholder="Website", type="url")
  .my-10
    input-body(label="Twitter Handle", :isFilled="modelValue.twitter.length")
      input(v-model="modelValue.twitter", placeholder="Twitter")
  .my-10
    input-body(label="Discord Invite Link", :isFilled="modelValue.discord.length")
      input(v-model="modelValue.discord", placeholder="Discord")
  .my-10
    input-body(label="Radicle Project ID", :isFilled="modelValue.radicleProjectId.length", format="code")
      input(v-model="modelValue.radicleProjectId", placeholder="Radicle Project ID")
  .my-10
    input-body(label="Github Project URL", :isFilled="modelValue.githubProject.length", format="code")
      input(v-model="modelValue.githubProject", placeholder="Github Project URL", type="url")

</template>
