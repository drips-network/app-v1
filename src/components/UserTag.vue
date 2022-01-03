<script setup>
import { computed, reactive } from 'vue'
import Addr from '@/components/Addr'
import AvatarBlockie from '@/components/AvatarBlockie'
import SvgGlobe from '@/components/SvgGlobe'
import SvgGithub from '@/components/SvgGithub'
import SvgTwitter from '@/components/SvgTwitter'
import SvgDiscord from '@/components/SvgDiscord'
import store from '@/store'
const props = defineProps(['address'])
const ensRecords = reactive({
  'avatar': null,
  'url': null,
  'com.twitter': null,
  'com.github': null,
  'vnd.github': null,
  'vnd.twitter': null,
  'vnd.discord': null,
})
const github = computed(() => ensRecords['com.github'] || ensRecords['vnd.github'])
const twitter = computed(() => ensRecords['com.twitter'] || ensRecords['vnd.twitter'])
const discord = computed(() => ensRecords['com.discord'] || ensRecords['vnd.discord'])

const getENSRecords = async ensName => {
  console.log(ensName)
  try {
    const resolver = await store.dispatch('getENSResolver', ensName)
    // get text records...
    Object.keys(ensRecords).forEach(key => {
      resolver.getText(key)
        .then(value => { ensRecords[key] = value; console.log(key, ensRecords[key]) })
        .catch(console.error)
    })
  } catch (e) {
    console.error(e)
  }
}
</script>

<template lang="pug">
.h-160.rounded-full.bg-indigo-700.flex.items-center.pr-60
  //- avatar
  .mx-24.mr-36
    template(v-if="ensRecords.avatar")
      .w-112.h-112.rounded-full.overflow-hidden.relative
        img.absolute.overlay.object-cover.object-center(:src="ensRecords.avatar", alt="Avatar Image", @error="ensRecords.avatar = null")
    template(v-else)
      avatar-blockie.w-112(:address="props.address", width="112", :key="props.address")
  
  div
    h1.text-2xl.font-bold
      addr(:address="props.address", :youOn="true", :key="props.address", @ens="getENSRecords")
    
    //- icons
    .flex.flex-wrap.-ml-8
      //- (website)
      template(v-if="ensRecords.url")
        a.block.px-4.notouch_hover_text-greenbright-500(:href="ensRecords.url", :target="_blank", rel="noopener noreferrer", title="Website")
          svg-globe.block.h-28.mt-8.-mb-12
      //- (twitter)
      template(v-if="twitter")
        a.block.px-4.notouch_hover_text-greenbright-500(:href="`https://twitter.com/${twitter}`", :target="_blank", rel="noopener noreferrer", title="Twitter")
          svg-twitter.block.h-28.mt-8.-mb-12
      //- (github)
      template(v-if="github")
        a.block.px-4.notouch_hover_text-greenbright-500(:href="`https://github.com/${github}`", :target="_blank", rel="noopener noreferrer", title="GitHub")
          svg-github.block.h-28.mt-8.-mb-12
      //- (discord)
      template(v-if="discord")
        a.block.px-4.notouch_hover_text-greenbright-500(:href="discord", :target="_blank", rel="noopener noreferrer", title="Discord")
          svg-discord.block.h-28.mt-8.-mb-12

</template>