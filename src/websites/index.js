export const websites = {}
export const hooks = {}
export const configs = []
const files = require.context('./', true, /\.js/)
files.keys().forEach(key => {
  const website = (key.split('/').pop().split('.') || {}) [0]
  if (![
    'index'
  ].includes(website)) {
    const { apply, config, hook } = files(key)
    websites[website] = apply
    hooks[website] = hook instanceof Object ? hook : {}
    configs.push(Object.assign({
      website
    }, config instanceof Object ? config : {}))
  }
})

export default {
  websites,
  configs,
  hooks
}
