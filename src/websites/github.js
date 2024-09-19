export const hosts = ['github.com']

export const options = {
  origin: 'github',
  link: false,
  br: true,
  code: false,
  selectors: {
    title: '#partial-discussion-header .markdown-title',
    body: '.js-quote-selection-container .markdown-body',
    copyBtn: '.copy-btn',
    userName: '[data-hovercard-type="user"]',
    userLink: '[data-hovercard-type="user"]',
    invalid: '',
    unpack: '',
    tag: '.js-issue-labels .IssueLabel'
  }
}

export const hook = {
}

export const config = {
  hosts,
  options,
  hook
}

export default config
