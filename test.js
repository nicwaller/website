const fs = require('fs');
const parse5 = require('parse5');

function metaFromHtml(html) {
    const document = parse5.parse(html);

    function mergeAttributes(accumulator, currentValue) {
        if (currentValue) {
            accumulator[currentValue['name']] = currentValue['content'];
        }
        return accumulator;
    }

    const meta = document.childNodes
        .filter(node => node.nodeName === 'html')[0].childNodes
        .filter(node => node.nodeName === 'head')[0].childNodes
        .filter(node => node.nodeName === 'meta')
        .map(node => node.attrs.filter(attr => attr.name === 'name' || attr.name === 'content'))
        .map(attrs => {

            const attrName = attrs.filter(attr => attr.name === 'name')[0];
            const attrContent = attrs.filter(attr => attr.name === 'content')[0];
            if (attrName && attrContent) {
                return {
                    name: attrName.value,
                    content: attrContent.value,
                };
            } else {
                return undefined;
            }
        })
        .reduce(mergeAttributes, {});

    return {
        keywords: ('keywords' in meta ? meta.keywords.split(',').map(x => x.trim()) : []),
        meta,
    }
}

function main() {
    if (process.argv.length < 3) {
        console.error('missing argument - to read from stdin');
        process.exit(1);
    }
    if (process.argv[2] !== '-') {
        console.error('only allowed argument is - for reading from stdin');
        process.exit(1);
    }

    // read from stdin
    const html = fs.readFileSync(0, 'utf-8');
    console.log(JSON.stringify(metaFromHtml(html), null, 2));
}

main();