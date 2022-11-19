<template>
  <q-page padding>
    <div v-if="validator === null" class="error-message column justify-center items-center">
      <div class="q-mt-lg">
        Validator address not found!
        <q-icon :name="infoIcon">
          <q-tooltip>
            {{ $route.params.address }}
          </q-tooltip>
        </q-icon>
      </div>
      <div>
        Did you change networks while on this page?
      </div>
    </div>

    <div v-else class="column justify-start items-start full-width">
      <div class="row justify-center items-center full-width q-mb-lg">
        <q-select
          v-model="selectedValidator"
          :options="validators"
          option-label="name"
          map-options
          outlined
          label="Selected validator"
          style="min-width: 300px;"
        />
      </div>
      <div class="row justify-between items-start full-width">
        <!-- Left Side -->
        <div class="column justify-start items-start">
          <div class="row justify-start items-center">
            <div class="column">
              <div class="row justify-start items-center">
                <div class="border-light identity-svg-wrapper" v-html="validator.identicon" />
                <div class="validator-name">{{ validator.name }}</div>
              </div>
              <div>{{ validator.address }}</div>
              <table class="identity-table">
                <tbody>
                  <tr v-if="parentName">
                    <td>Parent Name:</td><td>{{ parentName }}</td>
                  </tr>
                  <tr v-if="superName">
                    <td>Super Name:</td><td>{{ superName }}</td>
                  </tr>
                  <tr v-if="email">
                    <td>Email:</td><td>{{ email }}</td>
                  </tr>
                  <tr v-if="legal">
                    <td>Legal:</td><td>{{ legal }}</td>
                  </tr>
                  <tr v-if="riot">
                    <td>Riot:</td><td>{{ riot }}</td>
                  </tr>
                  <tr v-if="twitter">
                    <td>Twitter:</td><td>{{ twitter }}</td>
                  </tr>
                  <tr v-if="web">
                    <td>Web:</td><td>{{ web }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- Right Side -->
        <div class="column">
          <!-- TODO: Right Side - graphs -->
        </div>
      </div>
      <!-- End of split page -->
      <ValidatorRewardPoints :validator="validator" />
    </div>
  </q-page>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEntitiesStore } from 'src/stores/entities'
// import { useClientStore } from 'src/stores/client'
import { infoIcon } from 'assets/icons'

import ValidatorRewardPoints from 'components/ValidatorRewardPoints.vue'

export default {
  name: 'ValidatorInfo',

  components: {
    ValidatorRewardPoints
  },

  setup () {
    const route = useRoute()
    const router = useRouter()
    const entitiesStore = useEntitiesStore()
    // const clientStore = useClientStore()
    const selectedValidator = ref(null)

    const validators = computed(() => entitiesStore.getValidators)

    const validator = computed(() => {
      const v = entitiesStore.getValidators.find((val) => val.address === route.params.address)
      if (v) {
        // console.log('Selected validator:', v, clientStore)
        return v
      }
      return null
    })

    const parentName = computed(() => {
      if (validator.value.parent && validator.value.parent.identity.info.display !== 'None') {
        return validator.value.parent.identity.info.display.Raw
      }
      return ''
    })

    const superName = computed(() => {
      if (validator.value.super && validator.value.super.length > 0) {
        return validator.value.super[ 1 ].Raw
      }
      return ''
    })

    const email = computed(() => {
      if (validator.value.parent && validator.value.parent.identity.info.email !== 'None') {
        return validator.value.parent.identity.info.email.Raw
      }
      if (validator.value.identity && validator.value.identity.info.email !== 'None') {
        return validator.value.identity.info.email.Raw
      }
      return ''
    })

    const legal = computed(() => {
      if (validator.value.parent && validator.value.parent.identity.info.legal !== 'None') {
        return validator.value.parent.identity.info.legal.Raw
      }
      if (validator.value.identity && validator.value.identity.info.legal !== 'None') {
        return validator.value.identity.info.legal.Raw
      }
      return ''
    })

    const riot = computed(() => {
      if (validator.value.parent && validator.value.parent.identity.info.riot !== 'None') {
        return validator.value.parent.identity.info.riot.Raw
      }
      if (validator.value.identity && validator.value.identity.info.riot !== 'None') {
        return validator.value.identity.info.riot.Raw
      }
      return ''
    })

    const twitter = computed(() => {
      if (validator.value.parent && validator.value.parent.identity.info.twitter !== 'None') {
        return validator.value.parent.identity.info.twitter.Raw
      }
      if (validator.value.identity && validator.value.identity.info.twitter !== 'None') {
        return validator.value.identity.info.twitter.Raw
      }
      return ''
    })

    const web = computed(() => {
      if (validator.value.parent && validator.value.parent.identity.info.web !== 'None') {
        return validator.value.parent.identity.info.web.Raw
      }
      if (validator.value.identity && validator.value.identity.info.web !== 'None') {
        return validator.value.identity.info.web.Raw
      }
      return ''
    })

    watch(selectedValidator, (val) => {
      if (val.address !== route.params.address) {
        // push the new route
        router.push({
          name: 'validator',
          params: {
            address: val.address
          }
        })
      }
    })

    watch(validator, (val) => {
      if (val) {
        selectedValidator.value = val
      }
    })

    // const previousHistoryErasCount = computed(() => clientStore.getPreviousHistoryErasCount)

    // const erasList = computed(() => {
    //   const erasList = []
    //   const api = clientStore.client.api

    //   Array.from(Array(previousHistoryErasCount.value)).forEach(async (_, i) => {
    //     const eraStackers = await
    //   })
    // })

    return {
      selectedValidator,
      validators,
      validator,
      infoIcon,
      parentName,
      superName,
      email,
      legal,
      riot,
      twitter,
      web
    }
  }
}
</script>

<style lang="scss" scoped>
.error-message {
  font-size: 1.2rem;
  color: red;
}
.validator-name {
  font-size: 1.6rem;
}
.identity-table {
  //
}
</style>
