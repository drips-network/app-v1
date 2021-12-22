<script setup>
import { ref, toRaw } from 'vue'
import InputBody from '@/components/InputBody'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle'
import { pinImageToIPFS } from '@/store'
import { ipfsUrl } from '@/utils'

const props = defineProps(['modelValue', 'isNewProject'])
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
        alert('Image upload error. Perhaps the image is too large (500kb max) or the request timed out and you may try again.')
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

.h-144.w-144.mx-auto.relative.rounded-full.overflow-hidden.bg-indigo-950
  //- (default image)
  img.absolute.overlay.object-cover.pointer-events-none.opacity-50(v-if="!imgSrc", src="~@/assets/project-avatar-default.png")
  //- add image btn
  label.absolute.overlay.flex.items-center.justify-center.cursor-pointer.border.border-violet-800.rounded-full(tabindex="0", title="Community Avatar Image")
    span.sr-only Community Avatar Image
    input.hidden(type="file", accept=".png,.jpeg,.jpg", @change="onImgFileChange")
    svg-plus-minus-radicle

    //- .absolute.bottom-12.left-0.text-xs.text-violet-650.w-full.text-center max 200KB
  //- (image)
  img.absolute.overlay.object-cover.pointer-events-none(v-if="imgSrc", :src="imgSrc", alt="your project image")

.mt-8.text-sm.text-violet-650 Avatar

//- form(@submit.prevent="save", validate)
section.mt-40
  //- .my-10
    input-body(label="Owner", :isFilled="owner.length", format="code")
      input(v-model="owner", placeholder="owner", disabled)
  .my-10(v-if="props.isNewProject")
    input-body(label="Community Name*", :isFilled="modelValue.name.length", :class="{'text-red-600': props.isNewProject }")
      input(v-model="modelValue.name", placeholder="Computer Club", required, autocomplete="new-password")
  //- .my-10(v-if="props.isNewProject")
    //- TODO: format/validate symbol text?
    input-body(label="Member Token Symbol*", :isFilled="modelValue.symbol.length")
      input(v-model="modelValue.symbol", placeholder="CC", required)
  .my-10
    //- TODO: use textarea
    input-body(label="Description", :isFilled="modelValue.descrip.length")
      input(v-model="modelValue.descrip", placeholder="A club for computers.")
  .my-10
    input-body(label="Website URL", :isFilled="modelValue.website.length", format="code")
      input(v-model="modelValue.website", placeholder="https://computers.club", type="url")
  .my-10
    //- TODO: validate twitter
    input-body(label="Twitter Handle", :isFilled="modelValue.twitter.length")
      input(v-model="modelValue.twitter", placeholder="computerclub")
  .my-10
    input-body(label="Discord Invite URL", :isFilled="modelValue.discord.length", format="code")
      input(v-model="modelValue.discord", placeholder="https://discord.com/...")
  .my-10
    input-body(label="Radicle ID", :isFilled="modelValue.radicleID.length", format="code")
      input(v-model="modelValue.radicleID", placeholder="rad:git:hnrkq4w6pnnzpurokehxs69rbcqt6n4ipdfwy")
  .my-10
    input-body(label="GitHub Project URL", :isFilled="modelValue.githubProject.length", format="code")
      input(v-model="modelValue.githubProject", placeholder="https://github.com/...", type="url")

</template>
