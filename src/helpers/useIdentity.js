
import { ref, watch, computed } from 'vue'
import { trimHash } from 'src/helpers/utils'
import {
  solidCheckCircle,
  solidMinusCircle,
  solidPlusCircle,
  solidUserCircle
} from 'src/assets/icons'

export default function (address, subIdentities, api) {
  const
    hash = ref(address),
    identityInfo = ref(null),
    parentInfo = ref(null),
    superInfo = ref(null)

  watch(hash, () => {
    // call update api functions
    updateIdentity()
  })

  // private
  async function getIdentityInfo () {
    return await api.query.identity.identityOf(address)
  }

  // private
  async function getParentIdentity () {
    const sub = subIdentities.find((id) => {
      return id.sub === address
    })
    if (sub) {
      const parentIdentity = await api.query.identity.identityOf(sub.parent)
      if (parentIdentity) {
        return parentIdentity
      }
    }
  }

  // private
  async function getSuperIdentity () {
    return await api.query.identity.superOf(address)
  }

  async function updateEntityIdentity () {
    const identity = await getIdentityInfo()
    if (identity) {
      const identityHuman = identity.toHuman()
      if (identityHuman) {
        if (identityHuman.info) {
          identityInfo.value = {}
          identityInfo.value.info = identityHuman.info
        }
        if (identityHuman.judgements) {
          if (!identityInfo.value) {
            identityInfo.value = {}
          }
          // TODO: judgements will need to be checked for verified identities
          identityInfo.value.judgements = identityHuman.judgements
        }
      }
      const identityJSON = identity.toJSON()
      if (identityJSON && 'deposit' in identityJSON) {
        if (!identityInfo.value) {
          identityInfo.value = {}
        }
        identityInfo.value.deposit = identityJSON.deposit
      }
    }
  }

  async function updateParentIdentity () {
    const parentIdentity = await getParentIdentity(subIdentities)
    if (parentIdentity) {
      const parentIdentityHuman = parentIdentity.toHuman()
      if (parentIdentityHuman) {
        if (parentIdentityHuman.info) {
          parentInfo.value = {}
          parentInfo.value.identity = {}
          parentInfo.value.identity.info = parentIdentityHuman.info
        }
        const parentIdentityJSON = parentIdentity.toJSON()
        if (!parentInfo.value) {
          parentInfo.value = {}
          parentInfo.value.identity = {}
        }
        if (parentIdentityHuman.judgements) {
          parentInfo.value.identity.judgements = parentIdentityJSON.judgements
        }
      }
    }
  }

  async function updateSuperdentity () {
    const superIdentity = await getSuperIdentity(address, api)
    const superIdentityHuman = superIdentity.toHuman()
    if (superIdentityHuman) {
      superInfo.value = superIdentityHuman
    }
  }

  function isVerifiedIdentity () {
    if (!identityInfo.value || identityInfo.value?.judgements?.length === 0) {
      return false
    }
    return identityInfo.value?.judgements
      .filter(([ _, judgement ]) => !judgement.isFeePaid)
      .some(([ _, judgement ]) => judgement.isKnownGood || judgement.isReasonable)
  }

  const identityType = computed(() => {
    if (isVerifiedIdentity()) {
      return 'identity_verified'
    }
    else if (identityInfo.value?.info) {
      return 'identity_check'
    }
    else if (parentInfo.value?.identity?.info && superInfo.value) {
      return 'identity_plus'
    }
    return 'identity_none'
  })

  const hasIdentity = computed(() => {
    return identityType.value !== 'identity_none'
  })

  const identityTooltip = computed(() => {
    if (isVerifiedIdentity()) {
      return 'Identity verified'
    }
    else if (parentInfo.value && parentInfo.value.identity?.info && superInfo.value) {
      return 'Super identity is set'
    }
    else if (identityInfo.value && identityInfo.value?.info) {
      return 'Identity is set'
    }
    return 'identity is NOT set'
  })

  const identityIcon = computed(() => {
    if (isVerifiedIdentity(identityInfo.value || parentInfo.value)) {
      return solidUserCircle
    }
    else if (parentInfo.value && parentInfo.value.identity?.info && superInfo.value) {
      return solidPlusCircle
    }
    else if (identityInfo.value && identityInfo.value?.identity?.info) {
      return solidCheckCircle
    }
    return solidMinusCircle
  })

  const name = computed(() => {
    if (parentInfo.value?.identity?.info) {
      let parentName = parentInfo.value?.identity?.info?.display?.Raw || ''
      if (!superInfo.value) {
        return parentName
      }
      parentName += '/' + superInfo.value[ 1 ].Raw
      return parentName
    }

    // must come second as you can still have identity
    if (identityInfo.value?.info) {
      return identityInfo.value?.info?.display?.Raw || ''
    }

    if (address) {
      return trimHash(address, 16)
    }

    return '<unknown>'
  })

  const parentName = computed(() => {
    if (parentInfo.value && parentInfo.value.identity.info.display !== 'None') {
      return parentInfo.value.identity.info.display.Raw
    }
    return ''
  })

  const superName = computed(() => {
    if (superInfo.value && superInfo.value.length > 0) {
      return superInfo.value[ 1 ].Raw
    }
    return ''
  })

  const email = computed(() => {
    if (parentInfo.value && parentInfo.value.identity.info.email !== 'None') {
      return parentInfo.value.identity.info.email.Raw
    }
    if (identityInfo.value && identityInfo.value.info.email !== 'None') {
      return identityInfo.value.info.email.Raw
    }
    return ''
  })

  const legal = computed(() => {
    if (parentInfo.value && parentInfo.value.identity.info.legal !== 'None') {
      return parentInfo.value.identity.info.legal.Raw
    }
    if (identityInfo.value && identityInfo.value.info.legal !== 'None') {
      return identityInfo.value.info.legal.Raw
    }
    return ''
  })

  const riot = computed(() => {
    if (parentInfo.value && parentInfo.value.identity.info.riot !== 'None') {
      return parentInfo.value.identity.info.riot.Raw
    }
    if (identityInfo.value && identityInfo.value.info.riot !== 'None') {
      return identityInfo.value.info.riot.Raw
    }
    return ''
  })

  const twitter = computed(() => {
    if (parentInfo.value && parentInfo.value.identity.info.twitter !== 'None') {
      return parentInfo.value.identity.info.twitter.Raw
    }
    if (identityInfo.value && identityInfo.value.info.twitter !== 'None') {
      return identityInfo.value.info.twitter.Raw
    }
    return ''
  })

  const web = computed(() => {
    if (parentInfo.value && parentInfo.value.identity.info.web !== 'None') {
      return parentInfo.value.identity.info.web.Raw
    }
    if (identityInfo.value && identityInfo.value.info.web !== 'None') {
      return identityInfo.value.info.web.Raw
    }
    return ''
  })

  const hasVerifiedIdentity = computed(() => {
    return isVerifiedIdentity(identityInfo.value || parentInfo.value)
  })

  async function updateIdentity () {
    return await Promise.all([
      updateEntityIdentity(),
      updateParentIdentity(),
      updateSuperdentity()
    ])
  }

  return {
    updateIdentity,
    isVerifiedIdentity,
    identityInfo,
    parentInfo,
    superInfo,
    identityType,
    hasIdentity,
    hasVerifiedIdentity,
    identityTooltip,
    identityIcon,
    name,
    parentName,
    superName,
    email,
    legal,
    riot,
    twitter,
    web
  }
}
