const getLocal = (key) =>
  new Promise((resolve) => {
    chrome.storage.local.get(key, (data) => {
      resolve(data[key])
    })
})
const setWebsite = async (website, options) => {
  const localWebsites = await getLocal('websites')
  const websites = Object.assign(
    {},
    localWebsites instanceof Object ? localWebsites : {}
  )
  const valid = website
    &&
    options instanceof Object
    &&
    Array.isArray(options.hosts)
    &&
    options.hosts.length
    &&
    (options.selectors || {}).body
  if (valid) {
    options.origin = website
    Object.assign(
      websites,
      {
        [website]: options
      }
    )
    chrome.storage.local.set({
      websites
    })
  } else if (options === null) {
    delete websites[website]
    chrome.storage.local.set({
      websites
    })
  }
  return websites
}
window.setWebsite = setWebsite