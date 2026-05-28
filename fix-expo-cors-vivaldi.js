#!/usr/bin/env node
/**
 * fix-expo-cors-vivaldi.js
 *
 * Patches Expo's dev server CORS middleware so it accepts requests
 * coming from Vivaldi's own UI shell, which chromium treats as an
 * extension (ID: `mpognobbkildjkofajifpdfhcoklimli`). Without
 * the patch, `npm run web` in Vivaldi will probably, or at least possibly fail with:
 *
 *   Error: Unauthorized request from
 *   chrome-extension://mpognobbkildjkofajifpdfhcoklimli.
 *
 * The patch injects Vivaldi's extension ID into the file
 *   node_modules/.../@expo/cli/build/src/start/server/middleware/CorsMiddleware.js
 * right after `...DEFAULT_ALLOWED_CORS_HOSTNAMES`. It's safe to run multiple times
 * without consequence, and creates a `.vivaldi-patch.bak` backup next to each patched file.
 *
 * Usage (from your Expo project root):
 *   node fix-expo-cors-vivaldi.js            # apply the patch
 *   node fix-expo-cors-vivaldi.js --rollback # restore from .bak files
 *   node fix-expo-cors-vivaldi.js --check    # report status, do not write
 *
 * Note: `npm install` will overwrite node_modules and undo the patch. RIP.
 * To make it persistent across installs, see the patch-package
 * instructions that'll get printed at the end of a successful run.
 *
 * License: MIT. Share freely-- travel across the land, sharing far and wide...
 */

'use strict';

const fs = require('fs');
const path = require('path');

const VIVALDI_EXTENSION_ID = 'mpognobbkildjkofajifpdfhcoklimli';
const PATCH_MARKER = 'VIVALDI-CORS-PATCH';
const BACKUP_SUFFIX = '.vivaldi-patch.bak';

/**
 * looking for the default allowed hosts constant in createCorsMiddleware,
 * put vivaldi's ext ID in there.
 * the constant name has changed over the years...
 * - Newer @expo/cli:  DEFAULT_ALLOWED_CORS_HOSTS (which compares against URL.host)
 * - Older @expo/cli:  DEFAULT_ALLOWED_CORS_HOSTNAMES (which, you guessed it, compares again URL.hostname)
 * chrome-extension:// URLs don't have a port, so host === hostname
 * then the ext ID is correct for both paths.
 */
const PATCH_ANCHORS = [
    '...DEFAULT_ALLOWED_CORS_HOSTS',
    '...DEFAULT_ALLOWED_CORS_HOSTNAMES',
];

function makeInsertion(anchor) {
    return (
        `${anchor},\n` +
        `        // ${PATCH_MARKER}: allow Vivaldi's chrome-extension UI origin\n` +
        `        '${VIVALDI_EXTENSION_ID}'`
    );
}

function rel(p) {
    return path.relative(process.cwd(), p).replace(/\\/g, '/');
}

/** Walk node_modules looking for @expo/cli's CorsMiddleware.js (handles npm, yarn, pnpm layouts). */
function findCorsMiddlewareFiles(rootDir) {
    const matches = [];

    function walk(dir, depth) {
        if (depth > 14) return;

        let entries;
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
            return;
        }
        for (const entry of entries) {
            if (entry.name === '.git' || entry.name === '.cache') continue;
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(full, depth + 1);
            }
            else if (entry.isFile() && entry.name === 'CorsMiddleware.js') {
                const norm = full.replace(/\\/g, '/');
                if (
                    norm.includes('/@expo/cli/build/') &&
                    norm.endsWith('/server/middleware/CorsMiddleware.js')
                ) {
                    matches.push(full);
                }
            }
        }
    }

    walk(rootDir, 0);
    return matches;
}

function patchFile(file) {
    const original = fs.readFileSync(file, 'utf8');

    if (original.includes(PATCH_MARKER)) {
        return { status: 'already-patched' };
    }

    const anchor = PATCH_ANCHORS.find((a) => original.includes(a));
    if (!anchor) {
        return { status: 'anchor-missing' };
    }

    const patched = original.replace(anchor, makeInsertion(anchor));
    if (patched === original) {
        return { status: 'no-change' };
    }

    const backup = file + BACKUP_SUFFIX;
    if (!fs.existsSync(backup)) {
        fs.writeFileSync(backup, original, 'utf8');
    }
    fs.writeFileSync(file, patched, 'utf8');
    return { status: 'patched' };
}

function rollbackFile(file) {
    const backup = file + BACKUP_SUFFIX;
    if (!fs.existsSync(backup)) {
        return { status: 'no-backup' };
    }
    const backupContent = fs.readFileSync(backup, 'utf8');
    fs.writeFileSync(file, backupContent, 'utf8');
    fs.unlinkSync(backup);
    return { status: 'rolled-back' };
}

function checkFile(file) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(PATCH_MARKER)) return { status: 'patched' };
    if (!PATCH_ANCHORS.some((a) => content.includes(a))) return { status: 'anchor-missing' };
    return { status: 'unpatched' };
}

function main() {
    const args = new Set(process.argv.slice(2));
    const mode = args.has('--rollback') ? 'rollback' : args.has('--check') ? 'check' : 'patch';

    const cwd = process.cwd();
    const nodeModules = path.join(cwd, 'node_modules');

    if (!fs.existsSync(nodeModules)) {
        console.error(`No node_modules/ found in ${cwd}.`);
        console.error('Run this script from your Expo project root after npm install.');
        process.exit(1);
    }

    console.log(`Scanning ${rel(nodeModules)} for @expo/cli CorsMiddleware.js ...`);
    const files = findCorsMiddlewareFiles(nodeModules);

    if (files.length === 0) {
        console.error('No @expo/cli CorsMiddleware.js found. Is this an Expo project?');
        process.exit(1);
    }

    const counts = {};
    for (const file of files) {
        const result =
            mode === 'rollback' ? rollbackFile(file) :
            mode === 'check' ? checkFile(file) :
            patchFile(file);
        counts[result.status] = (counts[result.status] || 0) + 1;
        console.log(`  [${result.status.padEnd(16)}] ${rel(file)}`);
    }

    console.log(`\nDone (${mode}).`);
    for (const [k, v] of Object.entries(counts)) {
        console.log(`  ${k}: ${v}`);
    }

    if (mode === 'patch' && (counts['patched'] || counts['already-patched'])) {
        console.log(`
Next: start the dev server again ( npm run web ) and load the URL in Vivaldi.

This patch lives inside node_modules and will be wiped by the next install.
To make it survive future installs in THIS project:

  npm install --save-dev patch-package
  npx patch-package @expo/cli
  # then add to package.json:  "scripts": { "postinstall": "patch-package" }

That commits a patches/@expo+cli+X.Y.Z.patch file to your repo, and
patch-package will reapply it automatically after every install.
`);
    }

    if (counts['anchor-missing']) {
        console.warn(`
Heads up: ${counts['anchor-missing']} file(s) did not contain any of the
expected anchors (${PATCH_ANCHORS.join(' or ')}). Expo may have refactored
the middleware in your version. Open the file manually and add Vivaldi's
extension ID ('${VIVALDI_EXTENSION_ID}') to whatever allow-list is in use,
or file an issue at https://github.com/expo/expo so the allow-list is
fixed upstream.
`);
        process.exit(2);
    }
}

main();