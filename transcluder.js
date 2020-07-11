const fs = require('fs');
const path = require('path');
const RewritingStream = require('parse5-html-rewriting-stream');

// Finds all HTML <include src=""> tags and includes them, without recursion
// TODO: add an attribute for recursion?
// Input: filename
// Output: modified HTML
function transcludeFile(filename) {
    const dirname = path.dirname(filename);

    // TODO: maybe add noreferer/noopener to a href links
    const rewriter = new RewritingStream();
    rewriter.on('startTag', (startTag) => {
        if (startTag.tagName === 'include') {
            const srcFilename = startTag.attrs.find(({ name }) => name === 'src').value;
            const baseDir = srcFilename[0] === '/'
                ? path.join(__dirname, 'src')
                : dirname;
            const srcPath = path.join(baseDir, srcFilename);
            rewriter.emitRaw(fs.readFileSync(srcPath, 'utf-8'));
        } else {
            rewriter.emitStartTag(startTag);
        }
    });
    rewriter.on('endTag', (startTag) => {
        if (startTag.tagName !== 'include') {
            rewriter.emitEndTag(startTag);
        }
    });

    const inFile = fs.createReadStream(filename, 'utf-8');
    inFile.pipe(rewriter).pipe(process.stdout);
}

function main() {
    transcludeFile(process.argv[2]);
}

main();
