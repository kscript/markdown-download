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
  const rules = [
    [
      website && typeof website === 'string',
      '第一个参数应该是字符串类型, 并且不能为空'
    ],
    [
      Array.isArray(options.hosts) && options.hosts.length,
      'options.hosts应该是数组，并且长度不能为0'
    ],
    [
      (options.selectors || {}).body,
      'options.selectors.body不能为空'
    ]
  ]
  const hit = rules.find(item => !item[0])
  if (!hit) {
    options.origin = website
    options.timestamp = Date.now()
    options.hosts = options.hosts.map(item => item.toString())
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
  } else {
    hit[1] && console.warn(hit[1])
  }
  return websites
}
window.setWebsite = setWebsite