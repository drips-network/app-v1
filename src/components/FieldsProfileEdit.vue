<script setup>
import { ref, computed, toRaw } from 'vue'
import InputBody from '@/components/InputBody.vue'
import InputUploadFileIpfs from '@/components/InputUploadFileIpfs.vue'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle.vue'
// import { pinImageToIPFS } from '@/store'
import { ipfsUrl } from '@/utils'
import store from '@/store'

const props = defineProps(['modelValue', 'isNewProject'])
const emit = defineEmits(['update:modelValue'])

// current image ?
const imgSrcCurrent = props.modelValue.avatar ? ipfsUrl(props.modelValue.avatar) : undefined

const imgSrc = ref(imgSrcCurrent)

const nameInputError = computed(() => {
  return (props.modelValue.name || '').includes('.eth') ? '".eth" will be omitted' : null
})

const onImageUploaded = (ipfsHash) => {
  console.log(ipfsHash)
  const clone = toRaw(props.modelValue)
  clone.avatar = ipfsHash
  emit('update:modelValue', clone)
}
</script>

<template lang="pug">
//- avatar image upload
div
  .h-144.w-144.mx-auto.relative.rounded-full.overflow-hidden.bg-indigo-950
    //- (default image)
    img.absolute.overlay.object-cover.pointer-events-none.opacity-50(v-if="!imgSrc", src="~@/assets/project-avatar-default.png")
    //- add image btn
    label.absolute.overlay.flex.items-center.justify-center.cursor-pointer.border.border-violet-800.rounded-full(tabindex="0", title="Avatar Image", @keydown="e => e.keyCode === 13 && e.target.querySelector('input').click()")
      span.sr-only Avatar Image
      //- input.hidden(type="file", accept=".png,.jpeg,.jpg", @change="onImgFileChange")
      input-upload-file-ipfs.hidden(@read="e => { imgSrc = e }", @hash="onImageUploaded", @error="imgSrc = imgSrcCurrent")
      svg-plus-minus-radicle

      //- .absolute.bottom-12.left-0.text-xs.text-violet-650.w-full.text-center max 200KB
    //- (image)
    img.absolute.overlay.object-cover.pointer-events-none(v-if="imgSrc", :src="imgSrc", alt="your project image")

  .mt-8.text-sm.text-violet-650 Avatar Image

section.mt-40
  .my-10
    input-body(label="Name", :error="nameInputError")
      input(v-model="modelValue.name", placeholder="My Name", autocomplete="new-password", max-length="20")
  .my-10
    input-body(label="Website URL", :isFilled="modelValue.url.length")
      input(v-model="modelValue.url", placeholder="https://mywebsite.com", type="url")
  .my-10
    //- TODO: validate twitter
    input-body(label="Twitter Handle", :isFilled="modelValue['com.twitter'].length")
      input(v-model="modelValue['com.twitter']", placeholder="sophie")
  .my-10
    input-body(label="Discord Invite URL", :isFilled="modelValue.discord.length")
      input(v-model="modelValue.discord", placeholder="https://discord.com/...")
  //- .my-10
    input-body(label="Project's Radicle ID", :isFilled="modelValue.radicleID.length")
      input(v-model="modelValue.radicleID", placeholder="rad:git:hnrkq4w6pnnzpurokehxs69rbcqt6n4ipdfwy")
  .my-10
    input-body(label="GitHub URL", :isFilled="modelValue.github.length")
      input(v-model="modelValue.github", placeholder="https://github.com/...", type="url")

  .my-10
    input-body(label="Bio")
      textarea.text-center.scrollbars-hidden(v-model="modelValue.description", placeholder="I make it rain." rows="6")

</template>
