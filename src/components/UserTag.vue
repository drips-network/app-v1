<script setup>
import { computed, ref } from 'vue'
import Addr from '@/components/Addr.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import SvgGlobe from '@/components/SvgGlobe.vue'
import SvgGithub from '@/components/SvgGithub.vue'
import SvgTwitter from '@/components/SvgTwitter.vue'
import SvgDiscord from '@/components/SvgDiscord.vue'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle.vue'
import ExpandBlock from '@/components/ExpandBlock.vue'
import SvgDripOff from '@/components/SvgDripOff.vue'
import store from '@/store'
const props = defineProps(['address'])
const emit = defineEmits(['dripClick'])
const profile = computed(() => store.state.profiles.profiles[props.address])
const ensName = computed(() => profile.value?.ens?.name)
// const github = computed(() => profile.value['com.github'] || profile.value['vnd.github'])
// const twitter = computed(() => profile.value['com.twitter'] || profile.value['vnd.twitter'])
// const discord = computed(() => profile.value['com.discord'] || profile.value['vnd.discord'])
const avatarBroken = ref(false)
const record = key => store.getters['profiles/record'](props.address, key)
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
.user-tag
  .flex.justify-center
    //- user cell
    .max-w-5xl.p-16.lg_p-18.rounded-full.bg-indigo-700.flex.items-center
      //- avatar
      router-link.block.rounded-full(:to="{name: 'user', params: { address: props.address }}")
        user-avatar.w-80.h-80.lg_w-112.lg_h-112(:address="props.address", blockieSize="64")

      .ml-32.mr-36.lg_ml-40.lg_mr-44
        div
          //- name
          h1.text-2xl.font-bold
            addr(:address="props.address", :key="props.address")

        //- icons
        .mt-4.flex.flex-wrap.-ml-8.items-center
          //- (website)
          template(v-if="record('url')")
            a.block.px-4.notouch_hover_text-greenbright-500(:href="record('url')", target="_blank", rel="noopener noreferrer", title="Website")
              svg-globe.block.h-28.mt-8.-mb-12
          //- (twitter)
          template(v-if="record('twitter')")
            a.block.px-4.notouch_hover_text-greenbright-500(:href="getENSSocialUrl(record('twitter'), 'https://twitter.com/')", target="_blank", rel="noopener noreferrer", title="Twitter")
              svg-twitter.block.h-28.mt-8.-mb-12
          //- (github)
          template(v-if="record('github')")
            a.block.px-4.notouch_hover_text-greenbright-500(:href="getENSSocialUrl(record('github'), 'https://github.com/')", target="_blank", rel="noopener noreferrer", title="GitHub")
              svg-github.block.h-28.mt-8.-mb-12
          //- (discord)
          template(v-if="record('discord')")
            a.block.px-4.notouch_hover_text-greenbright-500(:href="getENSSocialUrl(record('discord'), 'https://discord.com/')", target="_blank", rel="noopener noreferrer", title="Discord")
              svg-discord.block.h-28.mt-8.-mb-12
          //- (ens name)
          template(v-if="ensName")
            a.block.px-4.mx-7.text-sm.font-semibold.h-22.pt-1.border.border-white-a60.text-greenbright-400ff.rounded.flex.items-center.mt-8.-mb-12.notouch_hover_text-greenbright-500.notouch_hover_border-current.leading-none(:href="`https://app.ens.domains/name/${ensName}`", target="_blank", rel="noopener noreferrer")
              | ENS

      //- drip-to btn
      button.mr-20.block.relative.text-violet-650.transform.notouch_hover_scale-110.transition.duration-150(@click.stop="$emit('dripClick')")
        //- drop bg
        <svg class="h-56 lg_h-72" viewBox="0 0 90 105" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
        <path d="M15.6969 29.619L15.8371 29.4896L15.9503 29.336C16.0314 29.2259 16.1276 29.1159 16.2413 29.0079L43.1004 3.48239C43.9729 2.65328 45.342 2.65328 46.2144 3.48239L47.1669 2.4801L46.2144 3.48239L73.0736 29.0079C73.1863 29.115 73.2818 29.2241 73.3625 29.3333L73.4752 29.4857L73.6145 29.6143C81.9838 37.3374 87.213 48.3569 87.213 60.5902C87.213 83.9234 68.1727 102.861 44.6583 102.861C21.1438 102.861 2.10352 83.9234 2.10352 60.5902C2.10352 48.3594 7.33064 37.3419 15.6969 29.619Z" fill="currentColor" stroke-width="2.125"/>
        </svg>

        .absolute.overlay.flex.items-center.justify-center.pt-8
          svg-plus-minus-radicle.text-indigo-900.lg_transform.lg_scale-125
          //- svg-plus-minus.text-indigo-900(style="transform:scale(1.25)")

  //- (bio cell)
  template(v-if="record('description')")
    //- vertical line
    //- .w-2.h-24.bg-indigo-700.mx-auto

    //- drip link
    svg-drip-off.block.h-15.text-indigo-700.mx-auto.mb-px
    svg-drip-off.block.h-15.text-indigo-700.mx-auto.transform.rotate-180

    //-
    .w-full.flex.justify-center.mb-1
      expand-block.relative.max-w-4xl.bg-indigo-700.rounded-2xl.text-center.px-32.pt-20.pb-24.font-semibold.text-lg.text-violet-650.leading-snug(:html="record('description')", expandedClasses="line-clamp-3", chevronInsetClass="bottom-0")

</template>
