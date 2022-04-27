<script setup>
import { ref, reactive, toRaw, markRaw } from 'vue'
import Panel from '@/components/Panel.vue'
import InputBody from '@/components/InputBody.vue'
import SvgPlusMinusRadicle from '@/components/SvgPlusMinusRadicle.vue'
// import MembershipInputGroup from '@/components/MembershipInputGroup'

const newTempl = () => ({
  name: '',
  minDAI: '',
  perks: ['']
})

const memberships = ref([
  newTempl()
])

const addMembership = () => memberships.value.push(newTempl())
const addPerk = (index) => memberships.value[index].perks.push('')

function onPerkInputKeydown (e, i, ii) {
  const perks = memberships.value[i].perks
  // delete perk row?
  if (e.code === 'Backspace' && !perks[ii].length && perks.length > 1) {
    perks.splice(ii, 1)
    // TODO: focus previous input
  }
}

const emit = defineEmits(['updated'])

const submit = () => {
  // filter out empty memberships
  memberships.value = memberships.value.filter(mship => mship.name.length && typeof mship.minDAI === 'number')
  // send
  emit('updated', memberships.value)
}
</script>

<template lang="pug">
panel.mx-auto(icon="🏅")
  template(v-slot:header)
    h2 Memberships

  p Optionally, set membership levels with different benefits you will provide.

  //- memberships list
  form.mt-60(@submit.prevent="submit")
    //- memberships...
    template(v-for="(membership, i) in memberships")
      section.my-10.input-group
        .flex.-mx-5
          .w-1x2.px-5
            input-body(label="Name", :isFilled="memberships[i].name.length", theme="dark")
              input(v-model="memberships[i].name", placeholder="Name")
          .w-1x2.px-5
            input-body(label="Min DAI", :isFilled="typeof memberships[i].minDAI === 'number'", theme="dark")
              input(v-model="memberships[i].minDAI", type="number", min="0", placeholder="Min DAI")

        ul
          //- perks...
          li.relative.mt-10(v-for="(perk, ii) in membership.perks")
            input-body(label="Benefit", :isFilled="memberships[i].perks[ii].length", theme="dark")
              input(v-model="memberships[i].perks[ii]", placeholder="Benefit", @keydown="e => onPerkInputKeydown(e, i, ii)")
            //-
            template(v-if="ii === membership.perks.length - 1")
              .absolute.top-0.right-0.h-full.flex.items-center.justify-center.pr-12
                button.bg-indigo-800.flex.items-center.justify-center.h-54.w-54.rounded-full(@click.prevent="addPerk(i)")
                  svg-plus-minus-radicle

    button.mt-10.block.w-full.rounded-full.h-80.flex.items-center.justify-center.border.border-violet-500(@click.prevent="addMembership", style="border-style:dashed")
      svg-plus-minus-radicle

    .mt-40
      button.btn.btn-lg.btn-indigo.mx-auto.min-w-sm(type="submit") Next

</template>
