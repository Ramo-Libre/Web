# PKGBUILD
pkgname=ramolibre
pkgver=1.0.0
pkgrel=1
pkgdesc="Organizador académico Local-First"
arch=('x86_64')
license=('MIT')
depends=('gtk3' 'webkit2gtk-4.1' 'cairo' 'glib2')

package() {
  # 1. Copiar el binario ejecutable
  install -Dm755 "${srcdir}/../src-tauri/target/release/app" "${pkgdir}/usr/bin/${pkgname}"

  # 2. Copiar icono en las rutas estándar de hicolor y pixmaps
  install -Dm644 "${srcdir}/../src-tauri/icons/128x128.png" "${pkgdir}/usr/share/icons/hicolor/128x128/apps/${pkgname}.png"
  install -Dm644 "${srcdir}/../src-tauri/icons/128x128.png" "${pkgdir}/usr/share/pixmaps/${pkgname}.png"

  # 3. Crear el lanzador .desktop
  install -dm755 "${pkgdir}/usr/share/applications"
  cat <<EOF > "${pkgdir}/usr/share/applications/${pkgname}.desktop"
[Desktop Entry]
Name=Ramo Libre
Comment=Organizador académico Local-First
Exec=/usr/bin/${pkgname}
Icon=${pkgname}
Terminal=false
Type=Application
Categories=Education;Utility;
StartupWMClass=ramolibre
EOF
}

# Forzar refresco del caché de iconos tras la instalación
post_install() {
  gtk-update-icon-cache -q -t -f usr/share/icons/hicolor || true
  update-desktop-database -q || true
}

post_upgrade() {
  post_install
}

post_remove() {
  post_install
}
