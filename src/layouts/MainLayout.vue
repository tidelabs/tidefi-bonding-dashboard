<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      elevated
      class="glass"
    >
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          TIDEFI Bonding Dashboard
          <q-icon v-if="$q.dark.isActive" size="md">
            <svg width="165" height="90" viewBox="0 0 165 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M99.8875 29.697C108.946 28.599 116.494 24.4817 124.18 20.5016C129.944 17.6194 135.571 14.7373 141.473 11.9924C145.041 10.3454 148.747 9.38471 152.727 9.6592C159.864 10.2082 164.53 14.8745 164.53 22.1485C164.53 31.8929 159.864 39.3041 151.629 44.2449C142.571 49.7347 133.101 49.7347 123.494 45.6174C115.808 42.3235 109.22 37.2454 102.77 32.0301C101.946 31.4812 100.985 30.6577 99.8875 29.697Z" fill="#7CBFE7"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M117.592 71.0075C133.101 72.38 145.727 67.0274 155.197 53.9892C154.511 54.2637 154.236 54.4009 153.962 54.5381C145.178 57.832 136.257 58.5182 127.199 56.4596C118.141 54.4009 110.318 50.0091 102.907 44.931C92.2017 37.657 82.5946 29.0107 72.9875 20.3643L72.9874 20.3641C66.6741 14.7371 60.0863 9.52178 52.5378 5.54167C45.4011 1.69881 37.8526 -0.359864 29.6179 0.0518711C13.972 1.01259 1.34545 13.3646 0.110246 29.0106C-0.713224 39.9902 3.12963 49.4601 9.85464 57.9693L11.0898 59.2045C11.3643 53.9892 12.5995 49.3228 15.7562 45.3427C22.4812 36.8335 31.2649 34.7749 41.421 36.8335C48.146 38.0687 54.0475 41.4999 59.8118 44.931C61.2688 45.814 62.7259 46.7006 64.184 47.5879C71.7911 52.2168 79.4293 56.8647 87.2608 61.1259C96.7307 66.3412 106.75 70.0468 117.592 71.0075ZM93.8481 89.1239C103.592 87.8887 112.788 85.1438 121.572 80.8892C120.539 80.756 119.507 80.6309 118.476 80.506C115.26 80.1162 112.063 79.7287 108.945 79.105C97.8282 77.0463 87.8093 72.38 78.2022 66.8902C72.1633 63.4133 66.2465 59.8144 60.3297 56.2155C57.3713 54.4161 54.413 52.6167 51.4394 50.8326C47.1848 48.3621 42.7929 46.4407 37.8521 45.6172C29.7547 44.382 22.8924 48.0877 20.8337 55.0871C19.1868 60.577 20.971 65.3805 24.2649 69.7724C27.0098 73.3407 30.5781 75.8111 34.421 78.0071C53.0863 88.1632 72.8496 91.8688 93.8481 89.1239Z" fill="white"/>
            </svg>
          </q-icon>
          <q-icon v-else size="md">
            <svg width="165" height="90" viewBox="0 0 165 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M99.8875 29.697C108.946 28.599 116.494 24.4817 124.18 20.5016C129.944 17.6194 135.571 14.7373 141.473 11.9924C145.041 10.3454 148.747 9.38471 152.727 9.6592C159.864 10.2082 164.53 14.8745 164.53 22.1485C164.53 31.8929 159.864 39.3041 151.629 44.2449C142.571 49.7347 133.101 49.7347 123.494 45.6174C115.808 42.3235 109.22 37.2454 102.77 32.0301C101.946 31.4812 100.985 30.6577 99.8875 29.697Z" fill="#7CBFE7"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M117.592 71.0075C133.101 72.38 145.727 67.0274 155.197 53.9892C154.511 54.2637 154.236 54.4009 153.962 54.5381C145.178 57.832 136.257 58.5182 127.199 56.4596C118.141 54.4009 110.318 50.0091 102.907 44.931C92.2017 37.657 82.5946 29.0107 72.9875 20.3643L72.9874 20.3641C66.6741 14.7371 60.0863 9.52178 52.5378 5.54167C45.4011 1.69881 37.8526 -0.359864 29.6179 0.0518711C13.972 1.01259 1.34545 13.3646 0.110246 29.0106C-0.713224 39.9902 3.12963 49.4601 9.85464 57.9693L11.0898 59.2045C11.3643 53.9892 12.5995 49.3228 15.7562 45.3427C22.4812 36.8335 31.2649 34.7749 41.421 36.8335C48.146 38.0687 54.0475 41.4999 59.8118 44.931C61.2688 45.814 62.7259 46.7006 64.184 47.5879C71.7911 52.2168 79.4293 56.8647 87.2608 61.1259C96.7307 66.3412 106.75 70.0468 117.592 71.0075ZM93.8481 89.1239C103.592 87.8887 112.788 85.1438 121.572 80.8892C120.539 80.756 119.507 80.6309 118.476 80.506C115.26 80.1162 112.063 79.7287 108.945 79.105C97.8282 77.0463 87.8093 72.38 78.2022 66.8902C72.1633 63.4133 66.2465 59.8144 60.3297 56.2155C57.3713 54.4161 54.413 52.6167 51.4394 50.8326C47.1848 48.3621 42.7929 46.4407 37.8521 45.6172C29.7547 44.382 22.8924 48.0877 20.8337 55.0871C19.1868 60.577 20.971 65.3805 24.2649 69.7724C27.0098 73.3407 30.5781 75.8111 34.421 78.0071C53.0863 88.1632 72.8496 91.8688 93.8481 89.1239Z" fill="#203F7D"/>
            </svg>
          </q-icon>
          </q-toolbar-title>

        <div class="column q-toolbar__title text-right ellipsis" style="font-size: 12px;">
          <div class="ellipsis">{{ clientStore.nodeName }} {{ clientStore.nodeVersion }}</div>
          <div class="ellipsis">{{ clientStore.consts.version.specName }}/{{ clientStore.consts.version.specVersion }}</div>
        </div>

        <q-btn
          aria-label="Dark theme toggle"
          flat
          round
          :icon="$q.dark.isActive ? matBrightness5 : matBrightness2"
          @click="$q.dark.toggle()"
        >
          <q-tooltip>Toggle dark mode</q-tooltip>
        </q-btn>

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-select
          v-model="selectedNetwork"
          :options="chains"
          option-label="name"
          map-options
          outlines
          :disable="isLoading"
          color="purple-13"
          label="Selected network"
          input-class="q-mx-sm"
        />
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>

        <InternalLink
          v-for="link in internalLinks"
          :key="link.title"
          v-bind="link"
        />

        <q-separator />
        <q-item-label
          header
        >
          External Links
        </q-item-label>

        <ExternalLink
          v-for="link in externalLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, onBeforeMount, getCurrentInstance, watch, computed } from 'vue'
import InternalLink from 'src/components/InternalLink.vue'
import ExternalLink from 'src/components/ExternalLink.vue'
import { useQuasar } from 'quasar'
import { useChainsStore } from 'stores/chain'
import { useEntitiesStore } from 'src/stores/entities'
import { useClientStore } from 'src/stores/client'
import { usePreferencesStore } from 'src/stores/preferences'
import {
  fabTwitter,
  fabFacebook,
  fabGithub,
  fabDiscord,
  fabYoutube,
  fabMedium,
  mdiHomeCircleOutline,
  fasHome,
  remNodeTree,
  fasAddressBook
} from 'assets/icons'
import { initializeClient } from 'src/helpers/utils'

const matBrightness2 = 'M0 0h24v24H0z@@fill:none;&&M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z'
const matBrightness5 = 'M0 0h24v24H0z@@fill:none;&&M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z'
const icoInputSearch = 'M21 12V10C21 7.23858 18.7614 5 16 5H8C5.23858 5 3 7.23858 3 10V10C3 12.7614 5.23858 15 8 15H12@@stroke-width:1.5;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;&&M20.1241 19.1185C20.6654 18.5758 21 17.827 21 17C21 15.3431 19.6569 14 18 14C16.3431 14 15 15.3431 15 17C15 18.6569 16.3431 20 18 20C18.8299 20 19.581 19.663 20.1241 19.1185ZM20.1241 19.1185L22 21@@stroke-width:1.5;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;'

const internalList = [
  {
    title: 'Home Page',
    caption: 'Chain info',
    icon: fasHome,
    to: { name: 'home' }
  },
  {
    title: 'Validator Nodes',
    caption: 'Comparative data',
    icon: remNodeTree,
    to: { name: 'validators' }
  },
  {
    title: 'Validator Lookup',
    caption: 'Quantitative data',
    icon: 'search',
    to: { name: 'validator-lookup' }
  },
  {
    title: 'Address Lookup',
    caption: 'Look yourself up!',
    icon: icoInputSearch,
    to: { name: 'address-lookup' }
  },
  {
    title: 'Address Book',
    caption: 'Manage your aliases',
    icon: fasAddressBook,
    to: { name: 'address-book' }
  }
]
const externalList = [
  {
    title: 'TIDEFI',
    caption: 'tidefi.com',
    icon: mdiHomeCircleOutline,
    link: 'https://tidefi.com'
  },
  {
    title: 'Tide Labs',
    caption: 'tidelabs.org',
    icon: 'school',
    link: 'https://tidelabs.org'
  },
  {
    title: 'GitHub',
    caption: 'tidelabs',
    icon: fabGithub,
    link: 'https://github.com/tidelabs'
  },
  {
    title: 'Twitter',
    caption: '@Tidefi_DEX',
    icon: fabTwitter,
    link: 'https://twitter.com/Tidefi_DEX'
  },
  {
    title: 'Facebook',
    caption: '@Tidefidex',
    icon: fabFacebook,
    link: 'https://facebook.com/tidefidex'
  },
  {
    title: 'Discord Chat',
    caption: 'chat.tidefi.com',
    icon: fabDiscord,
    link: 'https://chat.tidefi.com'
  },
  {
    title: 'YouTube',
    caption: 'Tidefi TV',
    icon: fabYoutube,
    link: 'https://youtube.com/@tidefi'
  },
  {
    title: 'Blog',
    caption: 'Medium',
    icon: fabMedium,
    link: 'https://tidefi-official.medium.com/'
  }
]

export default defineComponent({
  name: 'MainLayout',

  components: {
    InternalLink,
    ExternalLink
  },

  setup () {
    const leftDrawerOpen = ref(false)
    const vm = getCurrentInstance()
    const $q = useQuasar() || vm.proxy.$q || vm.ctx.$q
    const chainsStore = useChainsStore()
    const clientStore = useClientStore()
    const entitiesStore = useEntitiesStore()
    const preferencesStore = usePreferencesStore()
    const theme = ref(null)
    const selectedNetwork = ref(null)

    onBeforeMount(() => {
      let val = $q.localStorage.getItem('chainName')
      if (val === 'null') val = null
      if (val) {
        chainsStore.chainName = val
      }
      else {
        chainsStore.chainName = chainsStore.chains[ 0 ].name
      }

      preferencesStore.restoreFilters()
      preferencesStore.restoreAliases()
    })

    // ----------------------------------------------------
    // dark mode preferences
    theme.value = $q.localStorage.getItem('theme')

    watch(() => $q.dark.isActive, val => {
      theme.value = val ? 'dark' : 'light'
    })

    watch(theme, (val) => {
      $q.localStorage.set('theme', val)
    })

    function setTheme (theme) {
      if (theme === null) {
        $q.dark.set('auto')
      }
      else if (theme === 'dark') {
        $q.dark.set(true)
      }
      else {
        $q.dark.set(false)
      }
    }

    setTheme(theme.value)

    // ----------------------------------------------------
    // chain name
    const chainName = computed(() => chainsStore.chainName)
    const chains = computed(() => chainsStore.chains)

    const isLoading = computed(() => {
      if (clientStore.isLoading) {
        return true
      }
      return entitiesStore.isLoading
    })

    watch(chainName, async () => {
      const chain = chainsStore.chains.find((chain, index) => {
        if (chain.name === chainName.value) {
          chainsStore.chainName = chainName.value
          chainsStore.chainIndex = index
          return chain
        }
        return undefined
      })

      if (!chain) {
        setDefaultChain()
        return
      }

      $q.localStorage.set('chainName', chainsStore.chains[ chainsStore.chainIndex ].name)
      console.log(`chain specs changed to: ${ chainsStore.chains[ chainsStore.chainIndex ].name } (${ chainsStore.chains[ chainsStore.chainIndex ].rpc })`)

      selectedNetwork.value = chain

      await initializeClient()
      // await initializeEntities()
    })

    function setDefaultChain () {
      chainsStore.chainName = chainsStore.chains[ 0 ].name
      chainsStore.chainIndex = 0
      chainsStore.client = null
    }

    watch(selectedNetwork, (val) => {
      // console.log('selectedNetwork changed:', selectedNetwork.value)
      // verify different network
      if (chainsStore.chainName === val.name) {
        return
      }

      chainsStore.chainName = val.name
    })

    // async function initializeEntities () {
    //   // clear any existing entities
    //   entitiesStore.resetEntities()

    //   // get latest validators
    //   const validators = await chainsStore.client.api.query.session.validators()
    //   if (validators && validators.length > 0) {
    //     validators.forEach(async (val) => {
    //       // console.log('validator:', val)
    //       const validator = new Entity(val.toString(), val, true)
    //       await validator.connect()
    //       entitiesStore.entities.push(validator)
    //       console.log('validator:', validator)
    //     })
    //   }

    //   // const disabledValidators = await chainsStore.client.api.query.session.disabledValidators()
    //   // if (disabledValidators && disabledValidators.length > 0) {
    //   //   disabledValidators.forEach(async (val) => {
    //   //     // console.log('validator:', val)
    //   //     const validator = new Entity(chainsStore.client, val.toString(), val, true)
    //   //     await validator.connect()
    //   //     entitiesStore.validators.push(validator)
    //   //     console.log('validator:', validator)
    //   //   })
    //   // }
    // }

    return {
      internalLinks: internalList,
      externalLinks: externalList,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      clientStore,
      matBrightness2,
      matBrightness5,
      chains,
      selectedNetwork,
      isLoading
    }
  }
})
</script>
