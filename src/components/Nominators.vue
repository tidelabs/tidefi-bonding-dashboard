<template>
  <q-card v-if="validator && validator.nominatorCount > 0" class="info-table">
    <q-scroll-area style="height: 200px;">
      <table>
        <thead>
          <tr>
            <th colspan="3">Nominators ({{ validator.nominatorCount }}/{{ maxNominatorRewardedPerValidator }})</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="({address, hashAddress, formattedValue, identicon, value}, index) in nominators" :key="address">
            <tr :class="{ 'oversubscribed-highlight': index >= maxNominatorRewardedPerValidator }">
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
              <td class="text-right">
                {{ calcPercentage(value) }}%
              </td>
            </tr>
          </template>
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
      required: false,
      validator: (prop) => typeof prop === 'object' || prop === null
    }
  },

  setup (props) {
    const clientStore = useClientStore()

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
    })

    const total = computed(() => nominators.value.reduce((sum, nominator) => sum + parseInt(nominator.value), 0))
    const maxNominatorRewardedPerValidator = computed(() => clientStore.consts.maxNominatorRewardedPerValidator)

    function calcPercentage (value) {
      return (value * 100 / total.value).toFixed(2)
    }

    function formatTokenValue (val) {
      const clientStore = useClientStore()

      return clientStore.decimals.length > 0 ? toBaseToken(val, clientStore.decimals[ 0 ]) : 0
    }

    return {
      nominators,
      calcPercentage,
      maxNominatorRewardedPerValidator
    }
  }
}
</script>

<style lang="scss" scoped>
.info-table {
  max-width: 400px;
}
.oversubscribed-highlight {
  color: red;
}
</style>
