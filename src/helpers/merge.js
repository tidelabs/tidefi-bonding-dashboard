export function merge (json1, json2) {
  const uniques = []
  const conflicts = []

  for (const js2 of json2) {
    const found = json1.find((js1) => js1.name === js2.name && js1.address === js2.address)
    if (found) { // true
      conflicts.push(found)
    }
    else {
      uniques.push(js2)
    }
  }

  return { uniques, conflicts }
}
