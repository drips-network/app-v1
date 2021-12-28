<script setup>
import { computed, ref, onBeforeMount, inject } from 'vue'
import { useRoute } from 'vue-router'
import DripRow from '@/components/DripRow'
import InfoBar from '@/components/InfoBar'
import LoadingBar from '@/components/LoadingBar'
import Addr from '@/components/Addr'
import store from '@/store'
import { toDAIPerMo } from '@/utils'
import ModalEditDripsSelect from '@/components/ModalEditDripsSelect'
import ModalDripsEdit from '@/components/ModalDripsEdit'
import ModalSplitsEdit from '@/components/ModalSplitsEdit'

const route = useRoute()
const canEdit = inject('isMyUser')
const allDrips = inject('allDripsOut')
const emit = defineEmits(['editDrips'])
</script>

<template lang="pug">
section.user-splits

  //- (loading bar)
  template(v-if="allDrips === undefined")
    loading-bar

  //-
  template(v-else)
    //- info bar
    info-bar.mb-20.justify-center.px-32
      div
        template(v-if="canEdit") You are
        template(v-else) #[addr.font-bold(:address="$route.params.address")] is
        | &nbsp;<b>dripping</b> funds to <b>{{ allDrips.length }} address{{ allDrips.length === 1 ? '' : 'es' }}</b>

    ul
      //- all drips...
      li(v-for="drip in allDrips")
        drip-row.my-2(:drip="drip")

    //- edit btn footer
    template(v-if="canEdit")
      footer.w-full.sticky.bottom-20.left-0.w-full.mt-40.flex.justify-center.pointer-events-none
        button.btn.btn-lg.btn-violet.pl-36.pr-28.pointer-events-auto(@click="$emit('editDrips')")
          | {{ allDrips.length ? 'Edit' : 'Add' }} Drips 💧

</template>
