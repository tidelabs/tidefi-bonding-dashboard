<template>
  <q-page>
    <div class="row justify-evenly items-stretch col-xs-12 col-sm-6 col-md-4 col-lg-3">
      <CurrentBlock />
      <CurrentEpoch />
      <ActiveEra />
      <TotalIssuance />
      <TotalStaked />
      <PreviousEraRewards />
      <TotalValidators />
      <TotalNominators />
    </div>
    <router-view />
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import TotalStaked from 'components/TotalStaked.vue'
import TotalValidators from 'components/TotalValidators.vue'
import TotalNominators from 'components/TotalNominators.vue'
import CurrentBlock from 'components/CurrentBlock.vue'
import TotalIssuance from 'components/TotalIssuance.vue'
import ActiveEra from 'components/ActiveEra.vue'
import CurrentEpoch from 'components/CurrentEpoch.vue'
import PreviousEraRewards from 'components/PreviousEraRewards.vue'

export default defineComponent({
  name: 'IndexPage',
  components: {
    TotalStaked,
    TotalValidators,
    TotalNominators,
    CurrentBlock,
    TotalIssuance,
    ActiveEra,
    CurrentEpoch,
    PreviousEraRewards
  }
})
</script>
