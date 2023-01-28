<template>
  <q-card v-if="validator && validator.nominatorCount > 0" class="info-table">
    <q-scroll-area style="height: 200px;">
      <table>
        <thead>
          <tr>
            <th colspan="3">
              Nominators (<span
                :class="{ 'oversubscribed-highlight': validator.nominatorCount >= maxNominatorRewardedPerValidator}">
                {{ validator.nominatorCount }}
              </span>/{{ maxNominatorRewardedPerValidator }})
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="({address, hashAddress, alias, formattedValue, identicon, value, percentage}, index) in nominators" :key="address">
            <tr :class="{ 'oversubscribed-highlight': index >= maxNominatorRewardedPerValidator }">
              <td>
                <div class="row justify-start items-center">
                  <div class="border-light identity-svg-wrapper" v-html="identicon" />
                  <div>
                    <router-link
                      :to="{ name: 'address-lookup', params: { address: address } }"
                      class="entity-link"
                    >
                      {{ alias ? alias.name : hashAddress }}
                    </router-link>
                    <q-tooltip>{{ address }}</q-tooltip>
                  </div>
                </div>
              </td>
              <td class="text-right">
                {{ formattedValue }}
                <q-tooltip v-if="value !== 0">{{ value }}</q-tooltip>
              </td>
              <td class="text-right">
                {{ percentage }}%
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
import { trimHash, toBaseToken, normalizeValue, toNormalizeBaseToken } from 'src/helpers/utils'
import { useClientStore } from 'src/stores/client'
import { usePreferencesStore } from 'src/stores/preferences'

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
    const preferencesStore = usePreferencesStore()

    const nominators = computed(() => {
      const nominators = props.validator?.stakers?.others.map(({ who, value }) => {
        const percentage = (toNormalizeBaseToken(value, clientStore.decimals[ 0 ], clientStore.decimals[ 0 ]) * 100 / normalizeValue(props.validator.otherStaked)).toFixed(2)
        return {
          address: who,
          hashAddress: trimHash(who, 16),
          alias: preferencesStore.getAlias(who),
          value: toBaseToken(value, clientStore.decimals[ 0 ], clientStore.decimals[ 0 ]),
          formattedValue: formatTokenValue(value),
          identicon: toSvg(who, 24),
          percentage
        }
      })

      // highest first
      nominators.sort((a, b) => parseFloat(normalizeValue(b.value)) - parseFloat(normalizeValue(a.value)))

      // console.log('Nominators:', nominators)
      return nominators
    })

    const maxNominatorRewardedPerValidator = computed(() => clientStore.consts.maxNominatorRewardedPerValidator)

    function formatTokenValue (val) {
      const clientStore = useClientStore()

      return clientStore.decimals.length > 0 ? toBaseToken(val, clientStore.decimals[ 0 ]) : 0
    }

    return {
      nominators,
      maxNominatorRewardedPerValidator
    }
  }
}
</script>

<style lang="scss" scoped>
.info-table {
  max-width: 400px;
}
</style>
