export const hosts = ['zhuanlan.zhihu.com']

export const options = {
  origin: 'zhihu',
  link: false,
  br: true,
  code: false,
  selectors: {
    title: '.Post-Title',
    body: '.Post-RichText',
    copyBtn: '.copy-code-btn',
    userName: '.AuthorInfo-name .Popover .UserLink-link',
    userLink: '.AuthorInfo-name .Popover .UserLink-link',
    invalid: 'noscript,.ZVideoLinkCard-author',
    unpack: 'p,figure'
  }
}

export const hook = {}

export const config = {
  hosts,
  options,
  hook
}

export default config
