import { configs } from './websites'
import downloadZip from './download'

const getHeaders = (xhr, responseHeaders) => {
  const headers = {}
  if (Array.isArray(responseHeaders)) {
    responseHeaders.map(item => {
      headers[item] = xhr.getResponseHeader(item)
    })
  }
  return headers
}

const sendCallback = (sendResponse, responseHeaders) => {
  return {
    sendSuccess (message, xhr) {
      sendResponse([null, message, getHeaders(xhr, responseHeaders), xhr])
    },
    sendError (error, xhr) {
      sendResponse([error, null, getHeaders(xhr, responseHeaders), xhr])
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, responseHeaders } = message
  const { url, data, dataType, callback } = message
  const { fileName, files, options = {} } = message
  const { sendSuccess, sendError } = sendCallback(sendResponse, responseHeaders)
    if (/(get|post)/i.test(type)) {
      ajax({
        url,
        method: type,
        data,
        dataType,
        success (data, xhr) {
          if (/text|blob/i.test(dataType)) {
            sendSuccess(data, xhr)
          } else {
            const obj = dataType === 'text' ? data : JSON.parse(data)
            const result = /^json$/i.test(dataType) ? {
              callback: noop(callback),
              data: obj
            } : data
            if (typeof callback === 'string' && callback) {
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
    } else if (type === 'download') {
      downloadZip(fileName, files, options)
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
