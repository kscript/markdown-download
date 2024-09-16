import md5 from 'md5'
import JSZip from 'jszip'
import FileSaver from 'jszip/vendor/FileSaver'
import { options, mergeLocalOptions } from './options'
import { fetchBlobFile } from './request'

export const partTask = (items, handler, limit) => {
  let index = 0
  let list = items.slice(0)
  let queue = Promise.resolve()
  const result = []
  while (list.length) {
    const current = list.splice(0, limit)
    const currentIndex = index++
    queue = queue.then(() => {
      return new Promise((resolve) => {
        Promise.all(handler(current, currentIndex)).then(data => {
          result.push.apply(result, data)
        })
        .finally(() => resolve(result))
      })
    })
  }
  return queue
}

export const partRequest = (fileName, files, { requestLimit } = options) => {
  const zip = new JSZip()
  const handler = (files) => files.map(file => fetchBlobFile(file, zip).then(blob => {
    zip.file(file.name, blob)
    return blob
  }))
  return partTask(files, handler, requestLimit).then(() => {
    return zip.generateAsync({
      type: "blob"
    }).then((content) => {
      return new Promise((resolve) => {
        FileSaver(content, fileName);
        setTimeout(() => {
          resolve()
        }, 1.5e4)
      })
    })
  })
}

export const partDownload = (fileName, files, { partLimit } = options) => {
  const count = ~~(files.length / partLimit)
  return partTask(files, (files, index) => {
    const partName = count >= 1 ? '-p' + (index + 1) + '-' + count : ''
    const name = fileName + partName + '.zip'
    return [partRequest(name, files, options)]
  }, partLimit)
}

export const downloadZip = async (fileName, files, options = {}) => {
  fileName = fileName || md5(files.map(item => item.downloadUrl).join('|'))
  return partDownload(fileName, files, await mergeLocalOptions(options))
}

export default downloadZip