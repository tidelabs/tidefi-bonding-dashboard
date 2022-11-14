const hasSymbol = typeof Symbol === 'function'
  && typeof Symbol.toStringTag === 'symbol'

export const chainStoreKey = hasSymbol === true
  ? Symbol('_chain_store_')
  : '_chain_store_'

export const validatorsStoreKey = hasSymbol === true
  ? Symbol('_validator_store_')
  : '_validator_store_'
