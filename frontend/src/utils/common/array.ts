// 1. A random number in a given range getRandom(70, 80)
export const getRandom = (n: number, m: number) => Math.floor(Math.random() * (m - n + 1) + n)

// Generates an array of length 100
export function createArr(defaultParams = 'Tom') {
  const allItems = Array.from(Array(100).keys(), (item) => {
    return { defaultParams, idx: item }
  })
  // const fillArr = new Array(10).fill({ defaultParams })
  return allItems
}

// Get the deepest level of an array
export const getLevel = (list: any) => {
  let max = 0
  const stack = [list]
  while (stack.length > 0) {
    const data = stack.pop()
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      if (Array.isArray(item)) {
        (item as any).level = (data.level || 1) + 1
        max = Math.max((item as any).level, max)
        stack.push(item)
      }
    }
  }
  return max
}

// // Tree array tiling
// export const treeToArr = (arr: any) => {
//   const result = []
//   let node: any[] = []
//   node = node.concat(arr)
//   while (node.length) {
//     const first = node.shift() // Take the first item of node each time
//     if (first.children) {
//       node = node.concat(first.children) // If the first item has a children attribute, then put the children in the last item of the node.
//       delete first.children // Then delete the children attribute and make the first item become the normal form {name: xxx, id: xxx}
//     }
//     // result.push(first)
//   }
//   return result
// }
