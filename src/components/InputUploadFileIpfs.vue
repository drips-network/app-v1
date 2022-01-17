<script setup>
import { pinImageToIPFS } from '@/store'
const emit = defineEmits(['read', 'hash', 'error'])

const onImgFileChange = (e) => {
  const input = e.target
  if (input.files && input.files[0]) {
    var reader = new FileReader()
    reader.onload = async function (event) {
      const result = event.target.result
      emit('read', result)

      // upload to ipfs
      try {
        let resp = await pinImageToIPFS(result)
        resp = await resp.json()
        // oops
        if (resp.error) {
          throw new Error(resp.message)
        }
        emit('hash', resp.IpfsHash)
        // save
        // const clone = toRaw(props.modelValue)
        // clone.image = resp.IpfsHash
        // emit('update:modelValue', clone)
        return true
      } catch (e) {
        emit('error', e)
        console.error(e)
        // TODO - use FormMessage.vue
        alert('Image upload error. Perhaps the image is too large (500kb max) or the request timed out and you may try again.')
        // // revert img to current / empty
        // imgSrc.value = imgSrcCurrent
      }
    }
    reader.readAsDataURL(input.files[0])
  }
}
</script>

<template lang="pug">
input(type="file", accept=".png,.jpeg,.jpg,.svg", @change="onImgFileChange")
</template>
