#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
APK_DIR="$ROOT_DIR/src-tauri/gen/android/app/build/outputs/apk/universal/release"
UNSIGNED_APK="$APK_DIR/app-universal-release-unsigned.apk"

[ -f "$UNSIGNED_APK" ] || {
  echo "error: no existe $UNSIGNED_APK" >&2
  echo "ejecuta primero: tauri android build --apk" >&2
  exit 1
}

SDK_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
BUILD_TOOLS="$(ls -1d "$SDK_HOME"/build-tools/*/ 2>/dev/null | sort -V | tail -n1)"
[ -n "$BUILD_TOOLS" ] || {
  echo "error: no se encontro build-tools en $SDK_HOME" >&2
  exit 1
}
APKSIGNER="$BUILD_TOOLS/apksigner"
ZIPALIGN="$BUILD_TOOLS/zipalign"

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

KEYSTORE="$WORK_DIR/ramolibre-release.jks"
KEYSTORE_PASSWORD="$(head -c 18 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 16)"
KEY_ALIAS="ramolibre"

echo "==> keytool: generando keystore efimero"
keytool -genkeypair \
  -keystore "$KEYSTORE" \
  -storepass "$KEYSTORE_PASSWORD" \
  -keypass "$KEYSTORE_PASSWORD" \
  -alias "$KEY_ALIAS" \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=Ramo Libre, OU=Client, O=RamoLibre, L=Santiago, C=CL" \
  -noprompt

echo "==> zipalign"
ALIGNED_APK="$WORK_DIR/app-aligned.apk"
"$ZIPALIGN" -f -p 4 "$UNSIGNED_APK" "$ALIGNED_APK"

echo "==> apksigner sign"
SIGNED_APK="$APK_DIR/app-release-signed.apk"
"$APKSIGNER" sign \
  --ks "$KEYSTORE" \
  --ks-key-alias "$KEY_ALIAS" \
  --ks-pass "pass:$KEYSTORE_PASSWORD" \
  --key-pass "pass:$KEYSTORE_PASSWORD" \
  --out "$SIGNED_APK" \
  "$ALIGNED_APK"

echo "==> apksigner verify"
"$APKSIGNER" verify --verbose "$SIGNED_APK"

echo ""
echo "OK: $SIGNED_APK"
