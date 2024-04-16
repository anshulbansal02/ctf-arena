const path = require("path");

function toPascalCase(text) {
  return text.replace(/(^\w|-\w)/g, (v) => v.replace(/-/, "").toUpperCase());
}

function indexTemplate(filePaths) {
  const exportEntries = filePaths.map(({ path: filePath }) => {
    const basename = path.basename(filePath, path.extname(filePath));
    const exportName = `Svg${toPascalCase(basename)}`;
    return `export { default as ${exportName} } from './tsx/${basename}'`;
  });
  return exportEntries.join("\n");
}

module.exports = indexTemplate;
