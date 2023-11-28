import { tex2svg } from '../utils'
export const hosts = ['zhuanlan.zhihu.com']

export const options = {
  origin: 'zhihu',
  link: false,
  br: true,
  code: false,
  lazyKey: 'data-original',
  selectors: {
    title: '.Post-Title',
    body: '.Post-RichText',
    copyBtn: '.copy-code-btn',
    userName: '.AuthorInfo-name .UserLink-link',
    userLink: '.AuthorInfo-name .UserLink-link',
    invalid: 'noscript,.ZVideoLinkCard-author',
    unpack: 'p,figure',
    tag: '.TopicList .Tag-content'
  }
}

export const hook = {
  extract (context, { markdownBody }) {
    markdownBody.querySelectorAll('.ztext-math').forEach(item => {
      const ztext = document.createElement('ztext')
      ztext.innerText = encodeURIComponent(item.getAttribute('data-tex'))
      item.parentElement.replaceChild(ztext, item)
    })
  },
  formatContent (context, { markdownDoc }) {
    return tex2svg(markdownDoc)
  }
}

export const config = {
  hosts,
  options,
  hook
}

export default config
