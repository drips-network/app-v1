<script setup>
import { ref, computed, toRaw } from 'vue'
import InputBody from '@/components/InputBody.vue'
import InputUploadFileIpfs from '@/components/InputUploadFileIpfs.vue'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle.vue'
import SvgXCircle from '@/components/SvgXCircle.vue'
// import { pinImageToIPFS } from '@/store'
import { ipfsUrl } from '@/utils'
import store from '@/store'
import showdown from 'showdown'

const props = defineProps(['modelValue', 'isNewProject'])
const emit = defineEmits(['update:modelValue'])

// current image ?
const imgSrcCurrent = props.modelValue.avatar ? ipfsUrl(props.modelValue.avatar) : undefined

const imgSrc = ref(imgSrcCurrent)
const uploading = ref(false)

// bio
const markdown = new showdown.Converter()
const descriptionPreviewHtml = computed(() => props.modelValue?.descrip?.length && markdown.makeHtml(props.modelValue.descrip))

const nameInputError = computed(() => {
  return (props.modelValue.name || '').includes('.eth') ? '".eth" will be omitted' : null
})

const emitUpdate = (value = "") => {
  const clone = toRaw(props.modelValue)
  clone.avatar = value
  emit('update:modelValue', clone) 
}

const onImageRead = value => {
  uploading.value = true
  imgSrc.value = value
}

const onImageUploaded = (ipfsHash) => {
  emitUpdate(ipfsHash)
  uploading.value = false
}

const removeImage = () => {
  imgSrc.value = undefined
  emitUpdate()
}
</script>

<template lang="pug">
//- avatar image upload
.flex
  .relative.mx-auto
    .h-144.w-144.mx-auto.relative.rounded-full.overflow-hidden.bg-indigo-950(:class="{'animate-pulse': uploading}")
      //- (default image)
      img.absolute.overlay.object-cover.pointer-events-none.opacity-50(v-if="!imgSrc", src="~@/assets/project-avatar-default.png")
      
      //- add image btn overlay
      label.absolute.overlay.flex.items-center.justify-center.cursor-pointer.border.border-violet-800.rounded-full(tabindex="0", title="Avatar Image", @keydown="e => e.keyCode === 13 && e.target.querySelector('input').click()")
        span.sr-only Avatar Image
        //- input.hidden(type="file", accept=".png,.jpeg,.jpg", @change="onImgFileChange")
        input-upload-file-ipfs.hidden(@read="onImageRead", @hash="onImageUploaded", @error="imgSrc = imgSrcCurrent")
        svg-plus-minus-radicle.h-24.w-24

        //- .absolute.bottom-12.left-0.text-xs.text-violet-650.w-full.text-center max 200KB
      
      //- (uploaded image)
      img.absolute.overlay.object-cover.pointer-events-none(v-if="imgSrc", :src="imgSrc", alt="your project image")
    
    //- (remove image btn)
    button.absolute.-top-8.-right-16.notouch_hover_text-white.text-violet-650(v-if="imgSrc", @click.stop.prevent="removeImage")
      svg-x-circle.h-28.w-28

//- label
.mt-8.text-sm.text-violet-650
  | {{ uploading ? 'Uploading...' : 'Avatar Image' }}

section.mt-40
  .my-10
    input-body(label="Name", :error="nameInputError")
      input(v-model="modelValue.name", placeholder="Drips", autocomplete="new-password", max-length="20")
  .my-10
    input-body(label="Website URL", :isFilled="modelValue.url.length")
      input(v-model="modelValue.url", placeholder="https://drips.network", type="url")
  .my-10
    //- TODO: validate twitter
    input-body(label="Twitter Handle", :isFilled="modelValue['com.twitter'].length")
      input(v-model="modelValue['com.twitter']", placeholder="dripsnetwork")
  .my-10
    input-body(label="Discord Invite URL", :isFilled="modelValue.discord.length")
      input(v-model="modelValue.discord", placeholder="https://discord.com/...")
  //- .my-10
    input-body(label="Project's Radicle ID", :isFilled="modelValue.radicleID.length")
      input(v-model="modelValue.radicleID", placeholder="rad:git:hnrkq4w6pnnzpurokehxs69rbcqt6n4ipdfwy")
  .my-10
    input-body(label="GitHub URL", :isFilled="modelValue.github.length")
      input(v-model="modelValue.github", placeholder="https://github.com/...", type="url")

  .mt-10
    //- input-body(label="Bio")
      textarea.text-center.scrollbars-hidden(v-model="modelValue.description", placeholder="When you drip I drip we drip." rows="6")
    input-body.relative(label="Bio (Markdown/HTML)", :scrollable="true")
      textarea.font-mono.text-center.leading-normal.scrollbars-hidden.py-20(v-model="modelValue.descrip", placeholder="When you drip I drip we drip." rows="6")

    .mt-10.min-h-80.bg-indigo-700.rounded-2xlb.relative.leading-tight(v-if="descriptionPreviewHtml")
      .absolute.top-0.left-0.w-full.mt-4.text-ceter.text-mss.text-violet-650 Bio Preview
      div.px-24.pb-20.pt-28.text-center.text-xl.font-semibold.child-links-underline.child-lists-list.leading-relaxed(v-html="descriptionPreviewHtml")

</template>
