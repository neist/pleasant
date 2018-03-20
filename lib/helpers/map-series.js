// Borrowed from https://github.com/toniov/p-iteration/blob/master/lib/static-methods.js
export default async (array, callback) => {
  const result = []

  for (let i = 0; i < array.length; i++) {
    if (i in array) {
      result[i] = await callback.call(this, await array[i], i, array)
    }
  }

  return result
}
