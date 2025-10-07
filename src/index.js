import { websites, hooks } from './websites'
import {
  isExtension,
  sendMessage,
  getLocal,
  setWebsite
} from './utils'
import downloadZip from './download'
import { downloadMarkdown } from './markdown'
import { getLocalOptions } from './options'

const extract = async (options, customOptions = {}, hooks = {}) => {
  const localOptions = await getLocalOptions()
  const data = await downloadMarkdown(options, Object.assign(customOptions, {
    localOptions
  }), hooks)
  if (data) {
    if (data.type === 'download') {
      const { fileName, files, options = {} } = data
      downloadZip(fileName, files, options)
    } else {
      sendMessage(data)
    }
  }
  return data
}

if (isExtension) {
  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    const localWebsites = await getLocal('websites')
    if (message instanceof Object) {
      if (message.type === 'download') {
        const localWebsite = localWebsites[message.website]
        if (message.from === 'custom' && localWebsite instanceof Object) {
          const hookName = message.website || localWebsite.website || localWebsite.origin
          const customOptions = localWebsite.customOptions instanceof Object ? localWebsite.customOptions : {}
          const customHooks = Object.assign({},
            hooks[hookName] instanceof Object ? hooks[hookName] : {},
            localWebsite.hooks instanceof Object ? localWebsite.hooks : {}
          )
          await extract(
            localWebsite,
            customOptions,
            customHooks
          )
        } else
          if (typeof websites[message.website] === 'function') {
            await websites[message.website](extract)
          }
      }
    }
    sendResponse('')
  })
  window.setWebsite = setWebsite
}

export default downloadMarkdown