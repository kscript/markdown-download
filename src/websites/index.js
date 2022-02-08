const files = require.context('./', true, /\.js/)
const modules = {}

files.keys().forEach(key => {
  const name = (key.split('/').pop().split('.') || {}) [0]
  if (![
    'index',
    'list',
  ].includes(name)) {
    modules[name] = files(key)
  }
})

module.exports = modules