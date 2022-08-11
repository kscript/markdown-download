export const hosts = [/./]

export const options = {
  origin: 'default'
}

export const hook = {
  beforeExtract () {
    const fileName = document.title
    const name = document.title.replace(/(\/\\:\*\?\|<>")/g, '_') + '.html'
    const downloadUrl = location.href
    return {
      type: 'download',
      fileName,
      files: [
        {
          name,
          downloadUrl
        }
      ]
    }
  }
}

export const config = {
  hosts,
  options,
  hook
}

export default config