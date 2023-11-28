import md5 from 'md5'
export const hosts = ['www.jianshu.com', 'jianshu.com']

export const options = {
  origin: 'jianshu',
  link: false,
  br: true,
  code: false,
  selectors: {
    title: 'section+h1',
    body: 'header+div article,.post .article',
    copyBtn: '.VJbwyy',
    userName: '._3U4Smb ._1OhGeD',
    userLink: '._3U4Smb ._1OhGeD',
    invalid: '',
    unpack: '',
    tag: '._18vaTa ._1OhGeD span'
  }
}

export const hook = {
  extract (context, { markdownBody, realName }) {
    markdownBody.querySelectorAll('.math-block,.math-inline').forEach(item => {
      const ext = 'svg'
      const name = realName + '/' + md5(item.src) + (ext ? '.' + ext : '')
      item.setAttribute('downloadName', name)
      item.setAttribute('downloadUrl', item.src)
    })
  }
}

export const config = {
  hosts,
  options,
  hook
}

export default config
