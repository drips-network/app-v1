<script setup>
import { ref, computed } from 'vue'
import store from '@/store'
import Panel from '@/components/Panel'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle'
import InputBody from '@/components/InputBody'

const props = defineProps({
  projectAddress: String
})

const newDrip = () => ({
  // name: '',
  address: '',
  percent: null
})

const drips = ref([
  newDrip()
])

const dripsFormatted = computed(() => {
  const dripFractionMax = 1_000_000
  const totalPercent = drips.value.reduce((acc, cur) => acc + (cur.percent || 0), 0)
  const dripFraction = parseInt(totalPercent / 100 * dripFractionMax)

  const receiverWeights = drips.value.map(drip => {
    return {
      receiver: drip.address,
      // weight of this receiver against the total dripFraction amount, as integer (max 10K)
      weight: parseInt((drip.percent / 100 * dripFractionMax) / dripFraction * 1000)
    }
  })

  return {
    dripFraction,
    receiverWeights
  }
})

const addDrip = () => drips.value.push(newDrip())

const emit = defineEmits(['dripsAdded', 'skip'])

const tx = ref(null)

const submit = async () => {
  try {
    tx.value = await store.dispatch('addDripToProject', {
      projectAddress: props.projectAddress,
      dripFraction: dripsFormatted.value.dripFraction,
      receiverWeights: dripsFormatted.value.receiverWeights
    })
    // wait for tx...
    await tx.value.wait()
    // finish
    emit('dripsAdded')
    tx.value = null
  } catch (e) {
    console.error(e)
    tx.value = null
  }
}
</script>

<template lang="pug">
panel.mx-auto(icon="💧")
  template(v-slot:header)
    h2 Drips

  p Share revenue with others with drips.<br>Add collaborators or project dependencies.

  //- drips list
  form.mt-60(@submit.prevent="submit", autocomplete="off")
    //- drips...
    template(v-for="(drip, i) in drips")
      section.my-10.input-group
        //- input address
        .mb-10
          input-body(label="ETH Address", :isFilled="drips[i].address === 'length'", theme="dark", format="code")
            input(v-model="drips[i].address", placeholder="ETH Address")
        //- input percent
        .flex.-mx-5
          //- .w-3x4.px-5
            input-body(label="Name", :isFilled="drips[i].name.length", theme="dark")
              input(v-model="drips[i].name", placeholder="Name")
          .flex-1
            input-body(label="Drip Amount (%)", :isFilled="typeof drips[i].percent === 'number'", theme="dark")
              input(v-model="drips[i].percent", type="number", min="0.01", max="100", step="0.01", placeholder="%")

    button.mt-10.block.w-full.rounded-full.h-80.flex.items-center.justify-center.border.border-violet-500(@click.prevent="addDrip", style="border-style:dashed")
      svg-plus-minus-radicle

    .mt-40.flex.justify-center
      .mx-5
        button.btn.btn-lg.btn-outline.mx-auto.min-w-xs(@click.prevent="emit('skip')") Skip
      .mx-5
        button.btn.btn-lg.btn-indigo.mx-auto.min-w-xs(type="submit", :disabled="tx")
          template(v-if="tx") Adding...
          template(v-else) Add

</template>
