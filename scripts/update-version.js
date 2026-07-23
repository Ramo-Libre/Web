import { readFileSync, writeFileSync } from 'node:fs';

const version = process.argv[2];

if (!version) {
	console.error('Usage: node scripts/update-version.js <version>');
	process.exit(1);
}

// ── package.json ──
const pkgPath = 'package.json';
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.version = version;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, '\t')}\n`);

// ── src/lib/utils/version.ts ──
const tag = `v${version}`;
writeFileSync('src/lib/utils/version.ts', `export const VERSION = "${tag}";\n`);

// ── PKGBUILD ──
const pkgbuildPath = 'PKGBUILD';
let pkgbuild = readFileSync(pkgbuildPath, 'utf8');
pkgbuild = pkgbuild.replace(/^(pkgver=).*/m, `$1${version}`);
writeFileSync(pkgbuildPath, pkgbuild);

// ── src-tauri/Cargo.toml ──
const cargoTomlPath = 'src-tauri/Cargo.toml';
let cargoToml = readFileSync(cargoTomlPath, 'utf8');
cargoToml = cargoToml.replace(/^(version\s*=\s*").*"/m, `$1${version}"`);
writeFileSync(cargoTomlPath, cargoToml);

// ── src-tauri/Cargo.lock ──
const cargoLockPath = 'src-tauri/Cargo.lock';
let cargoLock = readFileSync(cargoLockPath, 'utf8');
cargoLock = cargoLock.replace(
	/(name = "app"\nversion = ")[^"]*"/,
	`$1${version}"`,
);
writeFileSync(cargoLockPath, cargoLock);

// ── src-tauri/tauri.conf.json ──
const tauriConfPath = 'src-tauri/tauri.conf.json';
const tauriConf = JSON.parse(readFileSync(tauriConfPath, 'utf8'));
tauriConf.version = version;
writeFileSync(tauriConfPath, `${JSON.stringify(tauriConf, null, '\t')}\n`);
