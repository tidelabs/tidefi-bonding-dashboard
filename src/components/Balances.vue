<template>
  <q-card v-if="hasBalances" class="info-table">
    <table>
      <thead>
        <tr>
          <th colspan="2">Balances</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Free</td>
          <td class="text-right">{{ free }}</td>
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

    const free = computed(() => {
      if (props.entity && props.entity.balances) {
        return formatTokenValue(normalizeValue(props.entity.balances.free))
      }
      return 0
    })

    const bonded = computed(() => {
      if (props.entity && props.entity.balances) {
        return formatTokenValue(normalizeValue(props.entity.balances.miscFrozen))
      }
      return 0
    })

    const locked = computed(() => {
      if (props.entity && props.entity.balances) {
        return formatTokenValue(normalizeValue(props.entity.balances.locked))
      }
      return 0
    })

    const reserved = computed(() => {
      if (props.entity && props.entity.balances) {
        return formatTokenValue(normalizeValue(props.entity.balances.reserved))
      }
      return 0
    })

    const transferrable = computed(() => {
      if (props.entity && props.entity.balances) {
        return formatTokenValue(normalizeValue(props.entity.balances.transferrable))
      }
      return 0
    })

    const hasBalances = computed(() => {
      return free.value || bonded.value
        || locked.value || reserved.value
        || transferrable.value
    })

    return {
      free,
      bonded,
      locked,
      reserved,
      transferrable,
      hasBalances
    }
  }
}
</script>
