import { computed } from 'vue'
import { toSvg } from 'jdenticon'
import {
  getControllerInfo,
  getIdentityInfo,
  getParentIdentity,
  getSuperIdentity
} from '../helpers/validators'
import { trimHash, toBaseToken, normalizeValue } from '../helpers/utils'
import BN from 'bignumber.js'
import { useClientStore } from 'stores/client'
import { useEntitiesStore } from 'stores/entities'

export async function addOrUpdateEntity (address, validator = false) {
  const entitiesStore = useEntitiesStore()

  const entity = entitiesStore.entities.find((en) => en.address === address)
  if (entity) {
    // update validator in current set or not
    entity.validator = validator
    entity.connect()
  }
  else {
    const newEntity = new Entity(address, validator)
    await newEntity.connect()
    entitiesStore.entities.push(newEntity)
  }
}

export async function updateLastBlock (number, author) {
  const entitiesStore = useEntitiesStore()

  const validator = entitiesStore.getActiveValidators.find((validator) => validator.address === author)
  if (validator) {
    validator.lastBlock = number
  }
}

export class Entity {
  constructor (address, validator = false) {
    this.address = address
    //
    this.identicon = null
    this.free = 0
    this.freeHuman = 0
    this.reserved = 0
    this.miscFrozen = 0 // bonded
    this.feeFrozen = 0 // locked
    this.locked = 0
    this.transferrable = 0
    this.nonce = ''
    this.ledger = null
    // validator info
    this.validator = validator
    this.elected = false
    this.stakers = {
      total: '0',
      own: '0',
      others: []
    }
    this.preferences = {
      commission: 0,
      blocked: false
    }
    this.otherStaked = 0
    this.ownStaked = 0
    this.totalStaked = 0
    this.rewardPoints = 0
    // this.reputation = 0 // computed - future
    this.lastBlock = ''
    this.blockCount = 0
  }

  async connect () {
    const clientStore = useClientStore()
    const entitiesStore = useEntitiesStore()

    entitiesStore.incLoading()

    this.identicon = toSvg(this.address, 24)

    this.controller = await getControllerInfo(this.address, clientStore.client.api)
    await this.fetchIdentity()
    await this.updateParentIdentity()
    await this.updateSuperdentity()
    if (this.validator) {
      await this.updateStakerInfo()
    }
    await this.fetchBalances()
    await this.fetchLedger()

    // loading data done
    entitiesStore.decLoading()

    // this.reputation = computed(() => {
    //   return 5
    // })

    this.name = computed(() => {
      if (this.identity && this.identity.info) {
        return this.identity.info.display.Raw
      }

      if (this.parent && this.parent.identity.info) {
        let parentName = this.parent.identity.info.display.Raw
        if (!this.super) {
          return parentName
        }
        parentName += '/' + this.super[ 1 ].Raw
        return parentName
      }

      if (this.address) {
        return trimHash(this.address, 16)
      }

      return '<unknown>'
    })

    this.nominatorCount = computed(() => {
      if (this.stakers && this.stakers.others && this.stakers.others.length > 0) {
        return this.stakers.others.length
      }
      return 0
    })

    this.otherStaked = computed(() => {
      if (this.stakers && 'total' in this.stakers) {
        const total = this.stakers.total
        const own = this.stakers.own
        const t = new BN(total)
        const val = t.minus(own)
        return this.formatTokenValue(val)
      }

      return 'unknown'
    })

    this.ownStaked = computed(() => {
      return this.stakers && 'own' in this.stakers ? this.formatTokenValue(normalizeValue(this.stakers.own)) : this.formatTokenValue(this.locked)
    })

    this.totalStaked = computed(() => {
      return this.stakers && 'total' in this.stakers ? this.formatTokenValue(normalizeValue(this.stakers.total)) : 'unknown'
    })

    this.rewardPoints = computed(() => {
      const clientStore = useClientStore()

      return clientStore.rewardPoints[ clientStore.rewardPoints.length - 1 ].rewards.individual[ this.address ] || 0
    })
  }

  formatTokenValue (val) {
    const clientStore = useClientStore()

    return clientStore.decimals.length > 0 ? toBaseToken(val, clientStore.decimals[ 0 ]) : 0
  }

  async fetchBalances () {
    const clientStore = useClientStore()

    const validatorBalance = await clientStore.client.api.query.system.account(this.address)

    this.free = validatorBalance.data.free.toString()
    this.freeHuman = validatorBalance.data.free / Math.pow(10, clientStore.decimals[ 0 ])

    this.reserved = validatorBalance.data.reserved.toString()
    this.miscFrozen = validatorBalance.data.miscFrozen.toString() // bonded
    this.feeFrozen = validatorBalance.data.feeFrozen.toString() // locked
    this.locked = Math.max(validatorBalance.data.miscFrozen, validatorBalance.data.feeFrozen)
    this.transferrable = (validatorBalance.data.free - (Math.max(validatorBalance.data.miscFrozen, validatorBalance.data.feeFrozen))).toString()
    this.nonce = validatorBalance.nonce.toHuman()
  }

  async fetchIdentity () {
    const clientStore = useClientStore()

    const identity = await getIdentityInfo(this.address, clientStore.client.api)
    if (identity) {
      const identityHuman = identity.toHuman()
      if (identityHuman) {
        if (identityHuman.info) {
          this.identity = {}
          this.identity.info = identityHuman.info
        }
        if (identityHuman.judgements) {
          if (!this.identity) {
            this.identity = {}
          }
          this.identity.judgements = identityHuman.judgements
        }
      }
      const identityJSON = identity.toJSON()
      if (identityJSON && 'deposit' in identityJSON) {
        if (!this.identity) {
          this.identity = {}
        }
        this.identity.deposit = identityJSON.deposit
      }
    }
  }

  async updateParentIdentity () {
    const clientStore = useClientStore()

    const parentIdentity = await getParentIdentity(this.address, clientStore.subIdentities, clientStore.client.api)
    if (parentIdentity) {
      const parentIdentityHuman = parentIdentity.toHuman()
      if (parentIdentityHuman) {
        if (parentIdentityHuman.info) {
          this.parent = {}
          this.parent.identity = {}
          this.parent.identity.info = parentIdentityHuman.info
        }
        const parentIdentityJSON = parentIdentity.toJSON()
        if (!this.parent) {
          this.parent = {}
          this.parent.identity = {}
        }
        if (parentIdentityHuman.judgements) {
          this.parent.identity.judgements = parentIdentityJSON.judgements
        }
      }
    }
  }

  async updateSuperdentity () {
    const clientStore = useClientStore()

    const superIdentity = await getSuperIdentity(this.address, clientStore.client.api)
    const superIdentityHuman = superIdentity.toHuman()
    if (superIdentityHuman) {
      this.super = superIdentityHuman
    }
  }

  async updateStakerInfo () {
    const clientStore = useClientStore()

    // all validators in StakersEntries are in the elected set
    const stakerEntry = clientStore.stakerEntries.find((se) => se.address === this.address)
    if (stakerEntry) {
      this.elected = true
      this.stakers = stakerEntry.stakers
      this.preferences = stakerEntry.preferences
    }
    else {
      // console.log('Validator not in current set:', this.address)
      const validatorEntry = clientStore.validatorEntries.find((ve) => ve.address === this.address)
      if (validatorEntry) {
        this.elected = false
        this.stakers = []
        this.preferences = validatorEntry.data
      }
    }
  }

  async fetchLedger () {
    const clientStore = useClientStore()

    const ledger = await clientStore.client.api.query.staking.ledger(this.address)
    // console.log('ledger:', ledger.toJSON())
    this.ledger = ledger.toJSON()
  }
}
