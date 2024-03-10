import { websites } from './websites'
import { 
  isExtension,
  sendMessage,
  getLocalOptions
} from './utils'
import { downloadMarkdown } from './markdown'

const extract = async (options, customOptions, hook) => {
  const localOptions = await getLocalOptions()
  const data = await downloadMarkdown(options, Object.assign(customOptions, {
    localOptions
  }), hook)
  data && sendMessage(data)
  return data
}

if (isExtension) {
  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message instanceof Object) {
      if (message.type === 'download') {
        if (typeof websites[message.website] === 'function') {
          await websites[message.website](extract)
        }
      }
    }
    sendResponse('')
  })
}

export default downloadMarkdown