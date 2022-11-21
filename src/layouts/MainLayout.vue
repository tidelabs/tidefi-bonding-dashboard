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
          Tidefi Staking Dashboard
        </q-toolbar-title>

        <q-btn
          aria-label="Dark theme toggle"
          flat
          round
          :icon="$q.dark.isActive ? matBrightness5 : matBrightness2"
          @click="$q.dark.toggle()"
        />
        <div>{{ clientStore.nodeName }} {{ clientStore.nodeVersion }}</div>
        <!-- <div>Quasar v{{ $q.version }}</div> -->
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
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
// import { useEntitiesStore } from 'src/stores/entities'
import { Client } from '../classes/client'
// import { Entity } from '../classes/entity'
import { useClientStore } from 'src/stores/client'
import {
  fabTwitter,
  fabGithub,
  fabDiscord,
  mdiHomeCircleOutline,
  fasHome
} from 'assets/icons'

const matBrightness2 = 'M0 0h24v24H0z@@fill:none;&&M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z'
const matBrightness5 = 'M0 0h24v24H0z@@fill:none;&&M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z'

const internalList = [
  {
    title: 'Validator Nodes',
    // caption: 'quasar.dev',
    icon: fasHome,
    link: '/' // { name: 'validators' }
  },
  {
    title: 'Validator Lookup',
    // caption: 'quasar.dev',
    icon: 'search',
    link: '/validator' // { name: 'validator' }
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
    title: 'Discord Chat Channel',
    caption: 'chat.tidefi.com',
    icon: fabDiscord,
    link: 'https://chat.tidefi.com'
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
    // const entitiesStore = useEntitiesStore()

    onBeforeMount(() => {
      let val = $q.localStorage.getItem('chainName')
      if (val === 'null') val = null
      if (val) {
        chainsStore.chainName = val
      }
      else {
        chainsStore.chainName = chainsStore.chains[ 0 ].name
      }
    })

    const chainName = computed(() => chainsStore.chainName)

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

      await initializeClient()
      // await initializeEntities()
    })

    watch(() => $q.dark.isActive, (val) => {
      console.log(val ? 'On dark mode' : 'On light mode')
      window.Apex = {
        theme: {
          mode: $q.dark.isActive ? 'dark' : 'light'
        }
      }
    })

    function setDefaultChain () {
      chainsStore.chainName = chainsStore.chains[ 0 ].name
      chainsStore.chainIndex = 0
      chainsStore.client = null
    }

    async function initializeClient () {
      chainsStore.client = new Client(chainsStore.chains[ chainsStore.chainIndex ])
      await chainsStore.client.connect()
    }

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
      matBrightness5
    }
  }
})
</script>
