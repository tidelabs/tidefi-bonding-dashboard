<template>
  <q-card v-if="isFound" class="info-table">
    <table>
      <thead>
        <tr>
          <th colspan="2">Unapplied Slashes</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="slash in slashes" :key="slash.era">
          <tr>
            <td style="font-weight: 700;">Era</td>
            <td class="text-right">{{ slash.era }}</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Own</td>
            <td class="text-right">{{ formatTokenValue(slash.own) }}</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Payout</td>
            <td class="text-right">{{ formatTokenValue(slash.payout) }}</td>
          </tr>
          <tr v-if="slash.others && slash.others.length > 0">
            <td colspan="2" style="font-weight: 700;">Others</td>
          </tr>
          <tr v-if="slash.others && slash.others.length > 0">
            <td colspan="2">
              <table>
                <tbody>
                  <tr v-for="other in slash.others" :key="other[ 0 ]">
                    <td>{{ trimHash(other[ 0 ], 16) }}<q-tooltip>{{ other[ 0 ] }}</q-tooltip></td>
                    <td class="text-right">{{ formatTokenValue(other[ 1 ]) }}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </q-card>
</template>

<script>
import { computed } from 'vue'
import { useClientStore } from 'src/stores/client'
import { toBaseToken, trimHash } from 'src/helpers/utils'

export default {
  name: 'PreviousEraSlashes',

  props: {
    validator: {
      type: Object,
      required: false,
      validator: (prop) => typeof prop === 'object' || prop === null
    }
  },

  setup (props) {
    const clientStore = useClientStore()

    const isFound = computed(() => {
      if (!props.validator) return false
      return clientStore.unappliedSlashes.find(
        (slashes) => {
          return slashes.slashes.find(
            (slash) => {
              return slash.validator === props.validator.address
            })
        })
    })

    const slashes = computed(() => {
      if (!isFound.value) return []

      const sl = clientStore.unappliedSlashes.map(
        (eraSlashes) => {
          const era = eraSlashes.era
          const slashes = eraSlashes.slashes.reduce((agg, slash) => {
            if (slash.validator === props.validator.address) {
              agg = {
                ...agg,
                ...slash
              }
            }
            return agg
          }, {})

          return {
            era,
            ...slashes
          }
        }
      )

      // console.log('slashes:', sl)

      return sl
    })

    // console.log('Validator slashes:', slashes.value)

    function formatTokenValue (val) {
      return clientStore.decimals.length > 0 ? toBaseToken(val, clientStore.decimals[ 0 ]) : 0
    }

    return {
      isFound,
      slashes,
      formatTokenValue,
      trimHash
    }
  }
}
</script>
