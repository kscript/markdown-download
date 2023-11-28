import md5 from 'md5'
export const hosts = ['juejin.im', 'juejin.cn']

export const options = {
  origin: 'juejin',
  // 处理链接
  link: true,
  // 处理换行
  br: false,
  // 处理代码块
  code: false,
  selectors: {
    title: '.article-title',
    body: '.markdown-body',
    copyBtn: '.copy-code-btn',
    userName: '.username .name',
    userLink: '.username',
    invalid: 'style',
    unpack: '',
    tag: '.article-end .tag-list .tag-item'
  }
}

export const hook = {
  extract (context, { markdownBody, realName }) {
    markdownBody.querySelectorAll('img').forEach(item => {
      if (typeof item.src === 'string' && /\/equation\?tex=/.test(item.src)) {
        const ext = 'svg'
        const name = realName + '/' + md5(item.src) + (ext ? '.' + ext : '')
        item.setAttribute('downloadName', name)
        item.setAttribute('downloadUrl', item.src)
      }
    })
  }
}

export const config = {
  hosts,
  options,
  hook
}

export default config