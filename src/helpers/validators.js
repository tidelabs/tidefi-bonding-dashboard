export async function getControllerInfo (address, api) {
  return await api.query.staking.bonded(address)
}

export async function getIdentityInfo (address, api) {
  return await api.query.identity.identityOf(address)
}

// export async function getSubItentity (address, api) {
//   const subIdentities = []
//   const subIdentityEntry = await api.query.identity.subsOf(address)
//   // console.log('subIdentityEntry:', subIdentityEntry.toHuman())
//   const [ key, data ] = subIdentityEntry
//   Array(data.toJSON()[ 1 ]).forEach((sub) => {
//     subIdentities.push({
//       parent: key.toHuman()[ 0 ], sub
//     })
//   })

//   return subIdentities
// }

export async function getParentIdentity (address, subIdentities, api) {
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

export async function getSuperIdentity (address, api) {
  return await api.query.identity.superOf(address)
}
