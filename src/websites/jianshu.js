export const hosts = ['www.jianshu.com', 'jianshu.com']

export const options = {
  origin: 'jianshu',
  link: false,
  br: true,
  code: false,
  selectors: {
    title: 'section+h1',
    body: 'header+div article',
    copyBtn: '.VJbwyy',
    userName: '._3U4Smb ._1OhGeD',
    userLink: '._3U4Smb ._1OhGeD',
    invalid: '',
    unpack: ''
  }
}

export const hook = {}

export const config = {
  hosts,
  options,
  hook
}

export default config
