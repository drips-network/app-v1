<script setup>
import { ref, computed, toRaw } from 'vue'
import InputBody from '@/components/InputBody.vue'
import InputUploadFileIpfs from '@/components/InputUploadFileIpfs.vue'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle.vue'
// import { pinImageToIPFS } from '@/store'
import { ipfsUrl } from '@/utils'
import store from '@/store'
import showdown from 'showdown'

const props = defineProps(['modelValue', 'isNewProject'])
const emit = defineEmits(['update:modelValue'])

// current image ?
const imgSrcCurrent = props.modelValue.image ? ipfsUrl(props.modelValue.image) : undefined

const imgSrc = ref(imgSrcCurrent)

const onIpfsHash = (hash) => {
  const clone = toRaw(props.modelValue)
  clone.image = hash
  emit('update:modelValue', clone)
}

// description input
// const descriptionInputMd = ref('')
const converter = new showdown.Converter()
const descriptionInputHtml = computed(() => converter.makeHtml(props.modelValue.descrip))
</script>

<template lang="pug">
section.mt-40
  //- .my-10
    input-body(label="Owner", :isFilled="owner.length", format="code")
      input(v-model="owner", placeholder="owner", disabled)
  .my-10(v-if="props.isNewProject")
    input-body(label="Community Name*", :isFilled="modelValue.name.length", warning="⚠️ You cannot edit this later!")
      input(v-model="modelValue.name", placeholder="Computer Club", required, autocomplete="new-password")
  //- .my-10(v-if="props.isNewProject")
    //- TODO: format/validate symbol text?
    input-body(label="Member Token Symbol*", :isFilled="modelValue.symbol.length")
      input(v-model="modelValue.symbol", placeholder="CC", required)
  
  //- .my-10
    input-body(label="Description/Benefits")
      textarea.text-center.scrollbars-hidden(v-model="modelValue.descrip", placeholder="A club for computers." rows="6")
  
  .mt-10.mb-40
    input-body(label="Description (Markdown/HTML)")
      textarea.font-mono.text-center.leading-relaxed(v-model="modelValue.descrip", placeholder="Markdown/HTML" rows="7")

    .mt-10.min-h-80.bg-indigo-700.rounded-2xlb.relative.leading-tight
      .absolute.top-0.left-0.w-full.mt-4.text-ceter.text-mss.text-violet-650 Preview
      div.px-24.pb-20.pt-28.text-center.text-xl.font-semibold.child-links-underline.pointer-events-none.child-lists-list.leading-relaxed(v-html="descriptionInputHtml")

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
  
  //- .my-10
    input-body(label="Project Radicle ID", :isFilled="modelValue.radicleID.length", format="code")
      input(v-model="modelValue.radicleID", placeholder="rad:git:hnrkq4w6pnnzpurokehxs69rbcqt6n4ipdfwy")
  
  .my-10
    input-body(label="GitHub URL", :isFilled="modelValue.githubProject.length", format="code")
      input(v-model="modelValue.githubProject", placeholder="https://github.com/...", type="url")

</template>
