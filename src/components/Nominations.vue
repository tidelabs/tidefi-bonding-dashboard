<template>
  <q-card v-if="nominations.length > 0" class="info-table">
    <q-scroll-area style="height: 200px;">
      <table>
        <thead>
          <tr>
            <th colspan="3">Staker's Nominations ({{ nominations.length }})</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="nominator in nominations" :key="nominator.validator.address">
            <td>
              <div class="row justify-start items-center full-width">
                <div class="border-light identity-svg-wrapper" v-html="nominator.validator.identicon" />
                <div class="q-ml-sm">
                  <router-link
                    :to="{ name: 'validator-lookup', params: { address: nominator.validator.address } }"
                    class="entity-link full-width"
                  >
                    {{ nominator.validator.identity.name }}
                  </router-link>
                  <q-tooltip>{{ nominator.validator.address }}</q-tooltip>
                </div>
              </div>
            </td>
            <td class="text-right">
              {{ nominator.formattedValue }}
              <q-tooltip v-if="nominator.value !== 0">{{ nominator.value }}</q-tooltip>
            </td>
          </tr>
        </tbody>
      </table>
    </q-scroll-area>
  </q-card>
</template>

<script>
import { computed } from 'vue'
import { useEntitiesStore } from 'src/stores/entities'
import { toBaseToken } from 'src/helpers/utils'
import { useClientStore } from 'src/stores/client'

export default {
  name: 'Nominations',

  props: {
    entity: {
      type: Object,
      required: false,
      validator: (prop) => typeof prop === 'object' || prop === null
    }
  },

  setup (props) {
    const entitiesStore = useEntitiesStore()
    const clientStore = useClientStore()

    const nominations = computed(() => {
      const nominations = []
      if (props.entity && props.entity.nominations && props.entity.nominations.targets.length > 0) {
        props.entity.nominations.targets.forEach((target) => {
          const entity = entitiesStore.getValidatorByAddess(target)
          if (entity) {
            const other = entity.stakers.others.find((other) => other.who === props.entity.address)
            // console.log('Other:', other)
            nominations.push({
              validator: entity,
              value: other !== undefined ? toBaseToken(other.value, clientStore.decimals[ 0 ], clientStore.decimals[ 0 ]) : 0,
              formattedValue: other !== undefined ? formatTokenValue(other.value) : 'inactive'
            })
          }
        })
      }

      // console.log('Nominations:', nominations, props.entity)

      return nominations
    })

    function formatTokenValue (val) {
      const clientStore = useClientStore()

      return clientStore.decimals.length > 0 ? toBaseToken(val, clientStore.decimals[ 0 ]) : 0
    }

    return {
      nominations
    }
  }
}
</script>
