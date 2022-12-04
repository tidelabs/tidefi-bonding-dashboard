<template>
  <q-card v-if="validator" class="info-table">
    <table>
      <thead>
        <tr>
          <th colspan="2">Validator Stats</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="validator.stakedReturn">
          <td>Staked Return</td>
          <td class="text-right">{{ validator.stakedReturn }}%</td>
        </tr>
        <tr v-if="validator.nominatorCount">
          <td>Nominators</td>
          <td class="text-right">{{ validator.nominatorCount }}</td>
        </tr>
        <tr v-if="validator.otherStaked">
          <td>Other Staked</td>
          <td class="text-right">{{ validator.otherStaked }}</td>
        </tr>
        <tr v-if="validator.ownStaked">
          <td>Own Staked</td>
          <td class="text-right">{{ validator.ownStaked }}</td>
        </tr>
        <tr v-if="validator.totalStaked">
          <td>Total Staked</td>
          <td class="text-right">{{ validator.totalStaked }}</td>
        </tr>
        <tr>
          <td>Commission</td>
          <td class="text-right">{{ validator.preferences.commission }}</td>
        </tr>
        <tr>
          <td>Payee</td>
          <td  class="text-right">
            <div v-if="validator.payee.Account">Account<q-tooltip>{{ validator.payee.Account }}</q-tooltip></div>
            <div v-else>{{ validator.payee }}</div>
          </td>
        </tr>
        <tr v-if="validator.lastPaidOut">
          <td>Payout</td>
          <td class="text-right">{{ validator.lastPaidOut }}</td>
        </tr>
      </tbody>
    </table>
  </q-card>
</template>

<script>
// import { computed } from 'vue'

export default {
  name: 'ValidatorStats',

  props: {
    validator: {
      type: Object,
      required: false,
      validator: (prop) => typeof prop === 'object' || prop === null
    }
  }

  // setup (props) {

  //   return {
  //   }
  // }
}
</script>
