export const websites = {}
export const hooks = {}
export const configs = []
const files = require.context('./', true, /\.js/)
const assigns = {
  index: {},
  default: {}
}

files.keys().forEach(key => {
  const website = (key.split('/').pop().split('.') || {}) [0]
  if (![
    'index'
  ].includes(website)) {
    const config = files(key)
    const { hook, options, customOptions = {} } = config
    hooks[website] = hook instanceof Object ? hook : {}
    websites[website] = (extract) => extract(options, customOptions, hooks[website])
    if (assigns[website]) {
      assigns[website] = Object.assign({
        website
      }, config)
    } else {
      configs.push(Object.assign({
        website
      }, config))
    }
  }
})
configs.push(assigns.default)

export default {
  websites,
  configs,
  hooks
}
