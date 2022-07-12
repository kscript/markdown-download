import { configs } from './websites'
import downloadZip from './download'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const getHeaders = (xhr) => {
    const headers = {}
    if (Array.isArray(message.responseHeaders)) {
      message.responseHeaders.map(item => {
        headers[item] = xhr.getResponseHeader(item)
      })
    }
    return headers
  }
  const sendSuccess = (message, xhr) => {
    sendResponse([null, message, getHeaders(xhr), xhr])
  }
  const sendError = (error, xhr) => {
    sendResponse([error, null, getHeaders(xhr), xhr])
  }
  if (/(get|post)/i.test(message.type)) {
    ajax({
      url: message.url,
      method: message.type,
      data: message.data,
      dataType: message.dataType,
      success (data, xhr) {
        if (/text|blob/i.test(message.dataType)) {
          sendSuccess(data, xhr)
        } else {
          const obj = message.dataType === 'text' ? data : JSON.parse(data)
          const result = /^json$/i.test(message.dataType) ? {
            callback: message.callback,
            data: obj
          } : data
          if (typeof message.callback === 'string' && message.callback.length) {
            sendSuccess(result, xhr)
          } else {
            sendSuccess(obj, xhr)
          }
        }
      },
      error (error, xhr) {
        sendError(error, xhr)
      }
    })
  } else if (message.type === 'download') {
    downloadZip(message.fileName, message.files)
  }
  return true
})

const sendMessage = (message, onsuccess) => {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, (tabs) => {
    console.log(tabs)
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, message, onsuccess)
    }
  })
}

chrome.browserAction.onClicked.addListener((tab) => {
  const { host } = new URL(tab.url)
  const matched = configs.some(({ website, hosts }) => {
    if (
      website && Array.isArray(hosts) && hosts.some(item => item instanceof RegExp ? item.test(host) : item === host)
    ) {
      sendMessage({
        type: 'download',
        website
      })
      return true
    }
  })
  !matched && chrome.notifications.create(Date.now() + String(tab.id), { 
    type : 'basic',
    title : '下载提示',
    message : '当前页面不支持下载',
    iconUrl : '/icon.png'
  })
})
