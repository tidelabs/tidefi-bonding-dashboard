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
          <td class="text-right">{{ freeBalance }}</td>
        </tr>
        <tr>
          <td>Bonded</td>
          <td class="text-right">{{ bonded }}</td>
        </tr>
        <tr>
          <td>Locked</td>
          <td class="text-right">{{ locked }}</td>
        </tr>
        <tr>
          <td>Reserved</td>
          <td class="text-right">{{ reserved }}</td>
        </tr>
        <tr>
          <td>Transferrable</td>
          <td class="text-right">{{ transferrable }}</td>
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

    const freeBalance = computed(() => {
      if (props.entity && props.entity.balances) {
        // const total = String(parseInt(props.entity.balances.freeBalance) + parseInt(props.entity.bonded))
        // return formatTokenValue(normalizeValue(total))
        return formatTokenValue(normalizeValue(props.entity.balances.freeBalance))
      }
      return 0
    })

    const bonded = computed(() => {
      return formatTokenValue(normalizeValue(props.entity.bonded))
    })

    const locked = computed(() => {
      if (props.entity && props.entity.balances) {
        return formatTokenValue(normalizeValue(props.entity.balances.lockedBalance))
      }
      return 0
    })

    const reserved = computed(() => {
      if (props.entity && props.entity.balances) {
        return formatTokenValue(normalizeValue(props.entity.balances.reservedBalance))
      }
      return 0
    })

    const transferrable = computed(() => {
      if (props.entity && props.entity.balances) {
        return formatTokenValue(normalizeValue(props.entity.balances.availableBalance))
      }
      return 0
    })

    const hasBalances = computed(() => {
      return freeBalance.value || bonded.value
        || locked.value || reserved.value
        || transferrable.value
    })

    return {
      freeBalance,
      bonded,
      locked,
      reserved,
      transferrable,
      hasBalances
    }
  }
}
</script>
