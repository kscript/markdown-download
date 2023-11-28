export const hosts = ['blog.csdn.net']

export const options = {
  origin: 'csdn',
  link: false,
  br: true,
  code: false,
  selectors: {
    title: '#articleContentId',
    body: '#article_content',
    copyBtn: '.copy-code-btn',
    userName: '.user-info .name',
    userLink: '.user-info .profile-intro-name-boxTop a',
    invalid: '',
    unpack: '',
    tag: '.blog-tags-box .tag-link'
  }
}

export const hook = {}

export const config = {
  hosts,
  options,
  hook
}

export default config
