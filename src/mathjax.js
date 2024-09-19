import 'mathjax/es5/tex-svg'
export const tex2svg = (markdownDoc) => {
  return markdownDoc.replace(/<ztext>(.*?)<\/ztext>/g, (s, s1) => {
    const tex = decodeURIComponent(s1)
    const svg = MathJax.tex2svg(tex)
    svg.setAttribute('data-tex', tex)
    svg.style.display = 'inline'
    return svg.outerHTML
  })
}
export default {
  tex2svg
}