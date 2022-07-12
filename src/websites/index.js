export const websites = {}
export const hooks = {}
export const configs = []
const files = require.context('./', true, /\.js/)
files.keys().forEach(key => {
  const website = (key.split('/').pop().split('.') || {}) [0]
  if (![
    'index'
  ].includes(website)) {
    const config = files(key)
    const { hook, options } = config
    websites[website] = (extract) => extract(options)
    hooks[website] = hook instanceof Object ? hook : {}
    configs.push(Object.assign({
      website
    }, config))
  }
})

export default {
  websites,
  configs,
  hooks
}
