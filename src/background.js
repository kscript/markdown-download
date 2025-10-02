import { ajax, blob2array } from './request'
import { configs } from './websites'
import { getLocal, setWebsite } from './utils'

globalThis.setWebsite = setWebsite

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type } = message
  const { url, data, dataType } = message
  if (/(get|post)/i.test(type)) {
    ajax({
      url,
      method: type,
      data,
      dataType,
      success: async (data) => {
        if (/blob/i.test(dataType)) {
          sendResponse([null, {
            data: await blob2array(data),
            mimeType: data.type
          }])
        } else {
          sendResponse([null, data])
        }
      },
      error (error) {
        sendResponse([error, null])
      }
    })
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

chrome.action.onClicked.addListener(async (tab) => {
  const { host } = new URL(tab.url)
  const localWebsites = await getLocal('websites')
  const localConfigs = localWebsites instanceof Object ? Object.keys(localWebsites).reduce((acc, curr) => {
    return localWebsites[curr] instanceof Object ? acc.concat({
      website: curr,
      hosts: localWebsites[curr].hosts
    }) : acc
  }, []) : []
  const matched = localConfigs.concat(configs).some(({ website, hosts }) => {
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
