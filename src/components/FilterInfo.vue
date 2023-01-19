<template>
  <q-dialog :model-value="displayed">
    <q-card class="q-pa-md">
      <div class="column justify-center items-start">
        <div>
          The Filtering can be used to help you select the
          best validator to nominate via bonding. By selecting the
          filters that meet your needs, you can narrow down the amount
          of nominators to select from. Below is a description for each
          filter and it's use.
        </div>
        <table class="info-table q-mt-md" style="max-width: 100%;">
          <tbody>
            <tr>
              <td class="info-subtitle">Inactive Validators</td>
              <td class="vertical-top">
                An inactive validator has not been elected to the current set.
                However, you can still nominate them, which will help them get
                elected.
              </td>
            </tr>
            <tr>
              <td class="info-subtitle">Not Elected Next Set</td>
              <td class="vertical-top">
                An inactive or active validator may be elected to the next set.
                Not being elected to the next set means in the next era this validator will not be producing any blocks and not getting any era rewards.
              </td>
            </tr>
            <tr>
              <td class="info-subtitle">High Commission<br>(> 10%)</td>
              <td class="vertical-top">
                A validator with a high commission means there is less era rewards for the nominators.
              </td>
            </tr>
            <tr>
              <td class="info-subtitle">Oversubscribed</td>
              <td class="vertical-top">
                There is a maximum {{ maxNominatorRewardedPerValidator }} nominators allowed per validator
                that can share era rewards. Any nominators over this count, based on their bonded amounts, are oversubscribed and will not share in the era rewads.
              </td>
            </tr>
            <tr>
              <td class="info-subtitle">Blocked Nominations</td>
              <td class="vertical-top">
                If a validator is blocking nominations you cannot bond with them.
              </td>
            </tr>
            <tr>
              <td class="info-subtitle">No Identity</td>
              <td class="vertical-top">
                The identity exists so a nominator can recognize a validator. Besides
                a name, validators can add web, email, twitter, etc. A validator without
                some sort of identity is (supposedly) less-trustworthy than other validators.
              </td>
            </tr>
            <tr>
              <td class="info-subtitle">Payee Not Staked</td>
              <td class="vertical-top">
                A validator can specify where their own rewards go when a payout is done.
                It could be Staked, Stash, Controller, or even another address. However,
                if it is Staked, then the funds are automatically put into the validator's
                locked account. With all other types the paid out
                tokens are immediately available. By setting their payee to Staked, the
                validator is proving their financial commitment to running the validator.
              </td>
            </tr>
            <tr>
              <td class="info-subtitle">Self Controller</td>
              <td class="vertical-top">
                When a validator is set up, it is recommended to set up a controller account.
                The controller account pays gas fees associated with the validator, like paying
                out era rewards. A validator controlling itself in this way is not considered
                the best way of handling a validator.
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, watch } from 'vue'
import { useClientStore } from 'src/stores/client'

export default {
  name: 'FilterInfo',

  props: {
    modelValue: Boolean
  },

  emits: ['update:modelValue'],

  setup (props, { emit }) {
    const clientStore = useClientStore()

    const displayed = ref(props.modelValue)

    watch(() => props.modelValue, (val) => {
      // console.log('props.modelValue:', val)
      displayed.value = val
    })

    watch(displayed, (val) => {
      // console.log('displayed:', displayed.value)
      emit('update:modelValue', val)
    })

    return {
      displayed,
      maxNominatorRewardedPerValidator: clientStore.consts.maxNominatorRewardedPerValidator
    }
  }
}
</script>

<style lang="scss" scoped>
table.info-table {
  width: 100%;
  border-collapse: collapse;
  // border: 1px solid rgba(200, 200, 200, 0.4);
  border-radius: 4px;
}
table.info-table tbody {
  margin: 4px;
}
table.info-table tr:nth-child(odd) {
  background-color: rgba(200, 200, 200, 0.2);
}
table.info-table td {
  padding: 4px;
}
.info-title {
  font-size: 2rem;
  margin-bottom: 1.2rem;
}
.info-subtitle {
  font-weight: 700;
  vertical-align: top;
}
.info-highlight {
  font-weight: 700;
}
</style>
