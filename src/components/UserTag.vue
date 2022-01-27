<script setup>
import { computed, ref } from 'vue'
import Addr from '@/components/Addr'
import UserAvatar from '@/components/UserAvatar'
import SvgGlobe from '@/components/SvgGlobe'
import SvgGithub from '@/components/SvgGithub'
import SvgTwitter from '@/components/SvgTwitter'
import SvgDiscord from '@/components/SvgDiscord'
import store from '@/store'
const props = defineProps(['address'])
const profile = computed(() => store.state.addresses[props.address]?.records || {})
const github = computed(() => profile.value['com.github'] || profile.value['vnd.github'])
const twitter = computed(() => profile.value['com.twitter'] || profile.value['vnd.twitter'])
const discord = computed(() => profile.value['com.discord'] || profile.value['vnd.discord'])
const avatarBroken = ref(false)
const getENSSocialUrl = (value, base) => {
  try {
    // user erroneously added full URL into ENS com.XXX structure...
    const url = new URL(value)
    return url.href
  } catch (e) {
    return base + value
  }
}
</script>

<template lang="pug">
.user-tag.h-160.rounded-full.bg-indigo-700.flex.items-center.pr-60
  //- avatar
  router-link.block.rounded-full.mx-24.mr-36(:to="{name: 'user', params: { address: props.address }}")
    user-avatar.w-112.h-112(:address="props.address", blockieSize="112")

  div
    h1.text-2xl.font-bold
      addr(:address="props.address", :youOn="true", :key="props.address")

    //- icons
    .flex.flex-wrap.-ml-8
      //- (website)
      template(v-if="profile.url")
        a.block.px-4.notouch_hover_text-greenbright-500(:href="profile.url", target="_blank", rel="noopener noreferrer", title="Website")
          svg-globe.block.h-28.mt-8.-mb-12
      //- (twitter)
      template(v-if="twitter")
        a.block.px-4.notouch_hover_text-greenbright-500(:href="getENSSocialUrl(twitter, 'https://twitter.com/')", target="_blank", rel="noopener noreferrer", title="Twitter")
          svg-twitter.block.h-28.mt-8.-mb-12
      //- (github)
      template(v-if="github")
        a.block.px-4.notouch_hover_text-greenbright-500(:href="getENSSocialUrl(github, 'https://github.com/')", target="_blank", rel="noopener noreferrer", title="GitHub")
          svg-github.block.h-28.mt-8.-mb-12
      //- (discord)
      template(v-if="discord")
        a.block.px-4.notouch_hover_text-greenbright-500(:href="getENSSocialUrl(discord, 'https://discord.com/')", target="_blank", rel="noopener noreferrer", title="Discord")
          svg-discord.block.h-28.mt-8.-mb-12

</template>
