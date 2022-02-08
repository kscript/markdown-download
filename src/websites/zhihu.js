export const config = {
  hosts: ['zhuanlan.zhihu.com']
}

export const apply = (extract) => {
  extract({
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
  })
}

export default {
  config,
  apply
}
