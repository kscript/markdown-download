import { websites } from './websites'
import { 
  isExtension,
  sendMessage
} from './utils'
import downloadZip from './download'
import { downloadMarkdown } from './markdown'
import { getLocalOptions } from './options'

const extract = async (options, customOptions, hook) => {
  const localOptions = await getLocalOptions()
  const data = await downloadMarkdown(options, Object.assign(customOptions, {
    localOptions
  }), hook)
  if (data) {
    if (data.type === 'download') {
      const { fileName, files, options = {} } = data
      downloadZip(fileName, files, options)
    }  else {
      sendMessage(data)
    }
  }
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