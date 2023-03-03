<template>
  <q-card v-if="entity && hasBalances" class="info-table">
    <table>
      <thead>
        <tr>
          <th colspan="2">Balances (TDFY)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Balance</td>
          <td class="text-right">{{ freeBalance }}<q-tooltip>{{ freeBalanceTotal }}</q-tooltip></td>
        </tr>
        <tr>
          <td>Bonded</td>
          <td class="text-right">{{ bonded }}<q-tooltip>{{ bondedTotal }}</q-tooltip></td>
        </tr>
        <tr>
          <td>Locked</td>
          <td class="text-right">
            {{ locked }}
            <q-tooltip>
              <template v-if="lockedReasons.length > 0">
                <table>
                  <tr v-for="{name, amount} in lockedReasons" :key="name">
                    <td>{{ name }}</td>
                    <td class="text-right">{{ amount }}</td>
                  </tr>
                </table>
            </template>
            <span v-else>{{ lockedTotal }}</span>
          </q-tooltip>
        </td>
        </tr>
        <tr>
          <td>Reserved</td>
          <td class="text-right">{{ reserved }}<q-tooltip>{{ reservedTotal }}</q-tooltip></td>
        </tr>
        <tr>
          <td>Transferrable</td>
          <td class="text-right">{{ transferrable }}<q-tooltip>{{ transferrableTotal }}</q-tooltip></td>
        </tr>
      </tbody>
    </table>
  </q-card>
</template>

<script>
import { computed } from 'vue'
import { useClientStore } from 'stores/client'
import { toBaseToken, normalizeValue } from 'src/helpers/utils'

export default {
  name: 'Balances',

  props: {
    entity: {
      type: Object,
      required: false,
      validator: (prop) => typeof prop === 'object' || prop === null
    }
  },

  setup (props) {
    function formatTokenValue (val) {
      const clientStore = useClientStore()

      return clientStore.decimals.length > 0 ? toBaseToken(val, clientStore.decimals[ 0 ]) : 0
    }

    function formatTokenValueAll (val) {
      const clientStore = useClientStore()

      return clientStore.decimals.length > 0 ? toBaseToken(val, clientStore.decimals[ 0 ], clientStore.decimals[ 0 ]) : 0
    }

    const freeBalance = computed(() => {
      if (props?.entity?.balances?.freeBalance) {
        return formatTokenValue(normalizeValue(props.entity.balances.freeBalance))
      }
      return 0
    })

    const freeBalanceTotal = computed(() => {
      if (props?.entity?.balances?.freeBalance) {
        return formatTokenValueAll(normalizeValue(props.entity.balances.freeBalance))
      }
      return 0
    })

    const bonded = computed(() => {
      if (props?.entity?.bonded) {
        return formatTokenValue(normalizeValue(props.entity.bonded))
      }
      return 0
    })

    const bondedTotal = computed(() => {
      if (props?.entity?.bonded) {
        return formatTokenValueAll(normalizeValue(props.entity.bonded))
      }
      return 0
    })

    const locked = computed(() => {
      if (props?.entity?.balances?.lockedBalance) {
        return formatTokenValue(normalizeValue(props.entity.balances.lockedBalance))
      }
      return 0
    })

    const lockedTotal = computed(() => {
      if (props?.entity?.balances?.lockedBalance) {
        return formatTokenValueAll(normalizeValue(props.entity.balances.lockedBalance))
      }
      return 0
    })

    const reserved = computed(() => {
      if (props?.entity?.balances?.reservedBalance) {
        return formatTokenValue(normalizeValue(props.entity.balances.reservedBalance))
      }
      return 0
    })

    const reservedTotal = computed(() => {
      if (props?.entity?.balances?.reservedBalance) {
        return formatTokenValueAll(normalizeValue(props.entity.balances.reservedBalance))
      }
      return 0
    })

    const transferrable = computed(() => {
      if (props?.entity?.balances?.availableBalance) {
        return formatTokenValue(normalizeValue(props.entity.balances.availableBalance))
      }
      return 0
    })

    const transferrableTotal = computed(() => {
      if (props?.entity?.balances?.availableBalance) {
        return formatTokenValueAll(normalizeValue(props.entity.balances.availableBalance))
      }
      return 0
    })

    const hasBalances = computed(() => {
      return freeBalance.value || bonded.value
        || locked.value || reserved.value
        || transferrable.value
    })

    const lockedReasons = computed(() => {
      if (props?.entity?.balances?.lockedBreakdown?.length > 1) {
        return props.entity.balances.lockedBreakdown.map((locked) => {
          return {
            name: locked.id.trim(),
            amount: formatTokenValue(normalizeValue(locked.amount))
          }
        })
      }
      return []
    })

    return {
      freeBalance,
      freeBalanceTotal,
      bonded,
      bondedTotal,
      locked,
      lockedTotal,
      reserved,
      reservedTotal,
      transferrable,
      transferrableTotal,
      hasBalances,
      lockedReasons
    }
  }
}
</script>
