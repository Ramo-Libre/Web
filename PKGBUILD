pkgname=ramolibre
pkgver=0.1.0
pkgrel=1
pkgdesc="Organizador academico Local-First"
arch=('x86_64')
license=('MIT')
depends=('gtk3' 'webkit2gtk-4.1' 'cairo' 'glib2')

package() {
  # Copiar el binario
  install -Dm755 "${srcdir}/../src-tauri/target/release/app" "${pkgdir}/usr/bin/${pkgname}"

  # Copiar icono
  install -Dm644 "${srcdir}/../src-tauri/icons/128x128.png" "${pkgdir}/usr/share/pixmaps/${pkgname}.png"

  # Crear launcher .desktop para el menú de aplicaciones (Rofi/Wofi/etc)
  mkdir -p "${pkgdir}/usr/share/applications"
  cat <<EOF > "${pkgdir}/usr/share/applications/${pkgname}.desktop"
[Desktop Entry]
Name=Ramo Libre
Comment=Organizador academico Local-First
Exec=/usr/bin/${pkgname}
Icon=${pkgname}
Terminal=false
Type=Application
Categories=Education;Utility;
EOF
}
