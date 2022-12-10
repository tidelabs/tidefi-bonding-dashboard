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
          <tr v-for="validator in nominations" :key="validator.address">
            <td>
              <div class="row justify-start items-center full-width">
                <div class="border-light identity-svg-wrapper" v-html="validator.identicon" />
                <div class="q-ml-sm">
                  <router-link
                    :to="{ name: 'validator-lookup', params: { address: validator.address } }"
                    class="entity-link full-width"
                  >
                    {{ validator.identity.name }}
                  </router-link>
                  <q-tooltip>{{ validator.address }}</q-tooltip>
                </div>
              </div>

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

    const nominations = computed(() => {
      const nominations = []
      if (props.entity && props.entity.nominations && props.entity.nominations.targets.length > 0) {
        props.entity.nominations.targets.forEach((target) => {
          const entity = entitiesStore.getValidatorByAddess(target)
          if (entity) {
            nominations.push(entity)
          }
        })
      }

      return nominations
    })

    return {
      nominations
    }
  }
}
</script>
