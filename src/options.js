import { getLocal } from './utils'

const defaultOptions = {
  partLimit: 1e3,
  requestLimit: 5,
  retry: 3
}

export const options = Object.assign({}, defaultOptions)

export const getLocalOptions = async () => {
  const localOptions = await getLocal('localOptions')
  return localOptions instanceof Object ? localOptions : {}
}
export const mergeOptions = (newOptions) => {
  return Object.assign(options, defaultOptions, newOptions instanceof Object ? newOptions : {})
}
export const mergeLocalOptions = async () => {
  return Object.assign(mergeOptions(await getLocalOptions()))
}

export default {
  options,
  getLocalOptions,
  mergeOptions,
  mergeLocalOptions
}