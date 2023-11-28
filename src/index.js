import { websites } from './websites'
import { 
  isExtension,
  sendMessage,
} from './utils'
import { downloadMarkdown } from './markdown'

const extract = async (options, customOptions, hook) => {
  const data = await downloadMarkdown(options, customOptions, hook)
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