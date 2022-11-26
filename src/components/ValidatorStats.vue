<template>
  <q-card class="info-table">
    <table>
      <thead>
        <tr>
          <th colspan="2">Validator Stats</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Nominators</td>
          <td class="text-right">{{ validator.nominatorCount }}</td>
        </tr>
        <tr>
          <td>Other Staked</td>
          <td class="text-right">{{ validator.otherStaked }}</td>
        </tr>
        <tr>
          <td>Own Staked</td>
          <td class="text-right">{{ validator.ownStaked }}</td>
        </tr>
        <tr>
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
      required: true
    }
  }

  // setup (props) {

  //   return {
  //   }
  // }
}
</script>
