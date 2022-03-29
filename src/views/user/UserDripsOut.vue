<script setup>
import { computed, ref, onMounted, onUnmounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import DripRow from '@/components/DripRow.vue'
import InfoBar from '@/components/InfoBar.vue'
import LoadingBar from '@/components/LoadingBar.vue'
import Addr from '@/components/Addr.vue'
import store from '@/store'
import { toDAI, toDAIPerMo, round } from '@/utils'
import ModalEditDripsSelect from '@/components/ModalEditDripsSelect.vue'
import ModalDripsEdit from '@/components/ModalDripsEdit.vue'
import ModalSplitsEdit from '@/components/ModalSplitsEdit.vue'
import SvgDai from '@/components/SvgDai.vue'

const route = useRoute()
const emit = defineEmits(['editDripsSelect', 'editDrips', 'getWithdrawable'])

const canEdit = inject('isMyUser')
const allDrips = inject('allDripsOut') // drips + splits
const dripsOut = inject('dripsOut') // drips only

const dripsOutRate = computed(() => dripsOut.value && dripsOut.value.reduce((acc, cur) => acc + cur.amount, 0))

const withdrawable = inject('withdrawable')
const balance = computed(() => withdrawable.value === undefined ? '-' : toDAI(withdrawable.value))

let interval
const getWithdrawableEverySecond = () => {
  interval = setTimeout(() => {
    emit('getWithdrawable')
  }, 1000)
}

onMounted(() => getWithdrawableEverySecond())
onUnmounted(() => clearTimeout(interval))
</script>

<template lang="pug">
section.user-splits

  //- (loading bar)
  template(v-if="allDrips === undefined")
    loading-bar

  //- (drips list)
  template(v-else)
    //- info-bar.mb-20.justify-center.px-32
    //-   div
    //-     template(v-if="canEdit") You are
    //-     template(v-else) #[addr.font-bold(:address="$route.params.address")] is
    //-     | &nbsp;<b>dripping funds</b> to <b>{{ allDrips.length }} address{{ allDrips.length === 1 ? '' : 'es' }}</b>

    //- (balance)
    template(v-if="canEdit && dripsOut && dripsOut.length")
      section.mb-20.panel.panel-indigoff.border.border-violet-800.rounded-2xlb.p-16.text-violet-650
        //- header
        header.mb-12.flex.justify-between.items-center
          .flex.items-center
            .w-72.h-72.flex.items-center.justify-center.bg-indigo-800.text-3xl.rounded-full 💧
            h2.ml-24.text-xll.font-semibold.text-white Your Monthly Drips
          button.ml-24.mr-12.btn.btn-md.btn-violet.px-28.font-semibold.text-lg(@click="$emit('editDrips')") Add Funds

        .grid.grid-cols-2.gap-5

          .h-80.px-32.rounded-full.bg-indigo-950.flex.items-center.justify-between.font-semibold
            .flex-1.text-xl Drip Rate
            .flex.items-center.text-white
              .text-xl {{ dripsOutRate }}
              svg-dai.h-22.ml-14
              .text-xl.tracking-tight /MO

          .h-80.mt-2.px-12.rounded-full.bg-indigo-950.flex.items-center.justify-between.font-semibold
            .pl-20.flex-1.text-xl Current Balance
            .flex.items-center.text-white
              .text-xl {{ balance }}
              svg-dai.h-22.ml-12.mr-20
            //- button.ml-24.btn.btn-md.btn-violet.px-20.font-semibold.text-lg(@click="$emit('addFunds')") Add Funds

          //- .h-80.mt-2.px-32.rounded-full.bg-indigo-950.flex.items-center.justify-between.font-semibold
            .flex-1.text-xl Monthly Recipients
            .flex.items-center
              .text-xl.text-white {{ dripsOut.length }}

          //- .h-80.mt-2.px-32.rounded-full.bg-indigo-950.flex.items-center.justify-between.font-semibold
            .flex-1.text-xl Next Term
            .flex.items-center
              .text-xl.text-white - -

    //- info bar
    info-bar.mb-20.justify-center.relative(v-if="allDrips", :btnLabel="!canEdit ? undefined : allDrips.length ? 'Edit Drips' : 'Add Drips'", @btnClick="$emit('editDripsSelect')")
      div.text-center.w-full
        template(v-if="canEdit") You are
        template(v-else) #[addr.font-bold(:address="$route.params.address")] is
        | &nbsp;<b>dripping funds</b> to <b>{{ allDrips.length }} address{{ allDrips.length === 1 ? '' : 'es' }}</b>

    //- list
    ul
      //- all drips...
      li(v-for="drip in allDrips")
        drip-row.my-2(:drip="drip", :alternateColors="true")

    //- edit btn footer
    //- template(v-if="canEdit && !allDrips.length")
      footer.w-full.stickyff.bottom-20.left-0.w-full.mt-40.flex.justify-center.pointer-events-none
        button.btn.btn-lg.btn-violet.pl-36.pr-28.pointer-events-auto(@click="$emit('editDrips')")
          | Add Drips 💧

</template>
