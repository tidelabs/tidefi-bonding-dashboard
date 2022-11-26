<template>
  <q-card v-if="validator.nominatorCount > 0" class="info-table">
    <q-scroll-area style="height: 200px;">
      <table>
        <thead>
          <tr>
            <th colspan="2">Nominators</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="{address, hashAddress, formattedValue, identicon} in nominators" :key="address">
            <td>
              <div class="row justify-start items-center">
                <div class="border-light identity-svg-wrapper" v-html="identicon" />
                <div>
                  <router-link
                    :to="{ name: 'address-lookup', params: { address: address } }"
                    class="entity-link"
                  >
                    {{ hashAddress }}
                  </router-link>
                  <q-tooltip>{{ address }}</q-tooltip>
                </div>
              </div>
            </td>
            <td class="text-right">
              {{ formattedValue }}
            </td>
          </tr>
        </tbody>
      </table>
    </q-scroll-area>
  </q-card>
</template>

<script>
import { computed } from 'vue'
import { toSvg } from 'jdenticon'
import { trimHash, toBaseToken } from 'src/helpers/utils'
import { useClientStore } from 'src/stores/client'

export default {
  name: 'Nominators',

  props: {
    validator: {
      type: Object,
      required: true
    }
  },

  setup (props) {
    const nominators = computed(() => {
      const nominators = props.validator?.stakers?.others.map(({ who, value }) => {
        return {
          address: who,
          hashAddress: trimHash(who, 16),
          value,
          formattedValue: formatTokenValue(value),
          identicon: toSvg(who, 24)
        }
      })

      // highest first
      nominators.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))

      return nominators
    }) ?? []

    function formatTokenValue (val) {
      const clientStore = useClientStore()

      return clientStore.decimals.length > 0 ? toBaseToken(val, clientStore.decimals[ 0 ]) : 0
    }

    return {
      nominators
    }
  }
}
</script>
