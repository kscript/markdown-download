export const config = {
  hosts: ['www.jianshu.com', 'jianshu.com']
}

export const apply = (extract) => {
  extract({
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
  })
}

export default {
  config,
  apply
}
