require('mathjax/es5/tex-svg')
const tex2svg = (markdownDoc) => {
  return markdownDoc.replace(/<ztext>(.*?)<\/ztext>/g, (s, s1) => {
    const tex = decodeURIComponent(s1)
    const svg = MathJax.tex2svg(tex)
    svg.setAttribute('data-tex', tex)
    svg.style.display = 'inline'
    return svg.outerHTML
  })
}
Object.assign(module.exports, Object.assign(exports, {
  tex2svg
}))