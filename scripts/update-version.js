import { readFileSync, writeFileSync } from 'node:fs';

const version = process.argv[2];

if (!version) {
	console.error('Usage: node scripts/update-version.js <version>');
	process.exit(1);
}

const pkgPath = 'package.json';
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

pkg.version = version;

writeFileSync(pkgPath, `${JSON.stringify(pkg, null, '\t')}\n`);

const versionFilePath = 'src/lib/utils/version.ts';
const tag = `v${version}`;

writeFileSync(versionFilePath, `export const VERSION = "${tag}";\n`);
