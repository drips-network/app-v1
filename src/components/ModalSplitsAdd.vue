<script setup>
// TODO - make component for fields thats also used in Create panel...
import { ref } from 'vue'
import Modal from '@/components/Modal'
import { DialogTitle, DialogDescription } from '@headlessui/vue'
import Panel from '@/components/Panel'
import InputBody from '@/components/InputBody'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle'

// drips
const newDrip = () => ({
  // name: '',
  address: '',
  percent: null
})

const drips = ref([newDrip()])

const addDrip = () => drips.value.push(newDrip())
</script>

<template lang="pug">
modal(v-bind="$attrs", @close="$emit('close')")

  panel.z-10.m-auto(icon="💦")

    template(v-slot:header)
      dialog-title Add Splits

    template(v-slot:description)
      dialog-description.text-base.mx-auto.leading-relaxed(style="max-widthff:23em")
        | Share revenue with any Ethereum address using <b>Splits</b>.
        //- | Tokens will appear in your wallet, OpenSea and can be used to vote on proposals.

    form(@submit.prevent, validate)
      //- section.mt-60
      //- drips...
      template(v-for="(drip, i) in drips")
        section.my-10.input-group
          //- input address
          input-body.mb-10(label="Ethereum Address", :isFilled="drips[i].address === 'length'", theme="dark", format="code")
            //- TODO: validate ethereum address
            input(v-model="drips[i].address", placeholder="0x68fc...", autocomplete="new-password")

          //-
          input-body(label="% of Revenue", :isFilled="typeof drips[i].percent === 'number'", theme="dark")
            input(v-model="drips[i].percent", type="number", min="0.01", max="100", step="0.01", placeholder="5")

      button.mt-10.block.w-full.rounded-full.h-80.flex.items-center.justify-center.border.border-violet-500(@click.prevent="addDrip", style="border-style:dashed")
        svg-plus-minus-radicle

      .mt-40.mb-6.flex.justify-center
        button.btn.btn-lg.btn-violet.px-60.mx-auto Update
</template>
