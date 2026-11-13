/* eslint-env node */
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const storyRoot = path.join(projectRoot, 'src', 'story');

const getTweeFiles = (directory) => fs.readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return getTweeFiles(entryPath);
    return entry.isFile() && path.extname(entry.name) === '.twee' ? [entryPath] : [];
  });

const getLineNumber = (source, index) => source.slice(0, index).split('\n').length;

const getWikiLinkTarget = (linkMarkup) => {
  const withoutSetter = linkMarkup.split('][')[0];
  let target = withoutSetter;

  if (withoutSetter.includes('->')) {
    target = withoutSetter.slice(withoutSetter.lastIndexOf('->') + 2);
  } else if (withoutSetter.includes('<-')) {
    target = withoutSetter.slice(0, withoutSetter.indexOf('<-'));
  } else if (withoutSetter.includes('|')) {
    target = withoutSetter.slice(withoutSetter.lastIndexOf('|') + 1);
  }

  return target.trim();
};

const isStaticPassageTarget = (target) => (
  target.length > 0
  && !target.startsWith('$')
  && !target.startsWith('_')
  && !target.startsWith('`')
  && !/^[a-z][a-z\d+.-]*:/i.test(target)
);

const files = getTweeFiles(storyRoot);
const passages = new Set();
const links = [];

files.forEach((file) => {
  const source = fs.readFileSync(file, 'utf8');
  const passagePattern = /^::\s*([^\n[]+?)(?:\s+\[.*)?\s*$/gm;
  const wikiLinkPattern = /\[\[([\s\S]*?)\]\]/g;
  const linkMacroPattern = /<<link\s+(?:"[^"]*"|'[^']*')\s+(?:"([^"]+)"|'([^']+)')/g;

  Array.from(source.matchAll(passagePattern)).forEach((match) => {
    passages.add(match[1].trim());
  });

  Array.from(source.matchAll(wikiLinkPattern)).forEach((match) => {
    const target = getWikiLinkTarget(match[1]);
    if (isStaticPassageTarget(target)) {
      links.push({
        file,
        line: getLineNumber(source, match.index),
        target,
      });
    }
  });

  Array.from(source.matchAll(linkMacroPattern)).forEach((match) => {
    links.push({
      file,
      line: getLineNumber(source, match.index),
      target: match[1] || match[2],
    });
  });
});

const missingLinks = links.filter(({ target }) => !passages.has(target));

if (missingLinks.length === 0) {
  console.log(`Validated ${links.length} passage links: all targets exist.`);
  process.exit(0);
}

console.error(`Found ${missingLinks.length} link(s) targeting nonexistent passages:`);
missingLinks.forEach(({ file, line, target }) => {
  console.error(`- ${path.relative(projectRoot, file)}:${line} -> ${target}`);
});
process.exit(1);
