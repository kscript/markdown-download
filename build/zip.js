const fs = require('fs')
const path = require('path')
const AdmZip = require('adm-zip')
const pkg = require('../package.json')
const unpacked = path.join(process.cwd(), './dist')
if (fs.existsSync(unpacked)) {
  const zip = new AdmZip()
  zip.addLocalFolder(unpacked)
  zip.writeZip(path.resolve(`${pkg.name}.crx`))
}