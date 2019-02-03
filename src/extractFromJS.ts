export function findTaggedTemplateLiteralsInJS(jsCode: string, tag: string): string[] {
  // Hacky way to remove comments
  // This should allow commented out duplicate queries
  // src: https://stackoverflow.com/a/15123777
  const noComments = jsCode
    .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');

  // m for multiline
  // g for matching multiple results
  // capture the text inside the template literal with parentheses
  const regex = new RegExp(tag + '\\s*\`([\\s\\S]+?)\`', 'mg');
  const results = [];

  let result;
  // run in a loop to get all results
  while ((result = regex.exec(noComments)) !== null) {
    results.push(result[1]);
  }

  return results;
}

export function eliminateInterpolations(templateLiteralContents: string): string {
  const regex = /\$\{[\s\S]+?\}/mg;

  return templateLiteralContents.replace(regex, '');
}
