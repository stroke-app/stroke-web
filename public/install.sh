#!/bin/sh
# Install Stroke: curl -fsSL https://stroke.click/install.sh | sh
#   Nightly:   curl -fsSL https://stroke.click/install.sh | sh -s -- --nightly
#
# macOS: Homebrew if present, otherwise the .dmg. Linux: the AUR on Arch
# (yay or paru), the .deb on Debian and Ubuntu, the .rpm on Fedora and
# openSUSE, and the AppImage everywhere else, into ~/.local.
set -eu

REPO="stroke-app/stroke"
CHANNEL="stable"
for arg in "$@"; do
  case "$arg" in
    --nightly) CHANNEL="nightly" ;;
    -h|--help) sed -n '2,8p' "$0" 2>/dev/null || true; exit 0 ;;
  esac
done

say() { printf '\033[1m%s\033[0m\n' "$*"; }
fail() { printf 'stroke: %s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1; }
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  if need sudo; then SUDO="sudo"; elif need doas; then SUDO="doas"; fi
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
fetch() { curl -fL --progress-bar -o "$1" "$2"; }

if [ "$CHANNEL" = "nightly" ]; then
  TAG="nightly"
  BASE="https://github.com/$REPO/releases/download/nightly"
  DEB="stroke-nightly_amd64.deb"; RPM=""; APPIMAGE="stroke-nightly_amd64.AppImage"
  DMG_ARM="stroke-nightly_aarch64.dmg"; DMG_X64="stroke-nightly_x64.dmg"
else
  TAG="$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p' | head -1)"
  [ -n "$TAG" ] || fail "couldn't find the latest release; check your connection"
  V="${TAG#v}"
  BASE="https://github.com/$REPO/releases/download/$TAG"
  DEB="stroke_${V}_amd64.deb"; RPM="stroke-${V}-1.x86_64.rpm"; APPIMAGE="stroke_${V}_amd64.AppImage"
  DMG_ARM="stroke_${V}_aarch64.dmg"; DMG_X64="stroke_${V}_x64.dmg"
fi

OS="$(uname -s)"; ARCH="$(uname -m)"

# ── macOS ──────────────────────────────────────────────────────────────────
if [ "$OS" = "Darwin" ]; then
  if [ "$CHANNEL" = "stable" ] && need brew; then
    say "Installing Stroke $TAG with Homebrew"
    brew install --cask stroke-app/tap/stroke
    exit 0
  fi
  DMG="$DMG_X64"; [ "$ARCH" = "arm64" ] && DMG="$DMG_ARM"
  say "Downloading Stroke ($TAG)"
  fetch "$TMP/stroke.dmg" "$BASE/$DMG"
  MNT="$(hdiutil attach -nobrowse -readonly "$TMP/stroke.dmg" | tail -1 | awk -F'\t' '{print $NF}')"
  APP="$(ls -d "$MNT"/*.app | head -1)"
  rm -rf "/Applications/$(basename "$APP")"
  cp -R "$APP" /Applications/
  hdiutil detach "$MNT" -quiet || true
  # The build is ad-hoc signed: clear the download quarantine once.
  xattr -cr "/Applications/$(basename "$APP")" 2>/dev/null || true
  say "Installed /Applications/$(basename "$APP")"
  exit 0
fi

[ "$OS" = "Linux" ] || fail "unsupported system: $OS (download from https://stroke.click/download)"
[ "$ARCH" = "x86_64" ] || fail "Linux builds are x86_64 only for now (this is $ARCH)"

ID=""; ID_LIKE=""
[ -r /etc/os-release ] && . /etc/os-release
FAMILY="$ID $ID_LIKE"

install_appimage() {
  say "Downloading the AppImage ($TAG)"
  mkdir -p "$HOME/.local/bin" "$HOME/.local/share/applications" "$HOME/.local/share/icons/hicolor/256x256/apps"
  fetch "$HOME/.local/bin/stroke" "$BASE/$APPIMAGE"
  chmod +x "$HOME/.local/bin/stroke"
  curl -fsSL -o "$HOME/.local/share/icons/hicolor/256x256/apps/stroke.png" "https://stroke.click/icon.png" || true
  cat > "$HOME/.local/share/applications/stroke.desktop" <<DESKTOP
[Desktop Entry]
Name=Stroke
Comment=Database client
Exec=$HOME/.local/bin/stroke
Icon=stroke
Terminal=false
Type=Application
Categories=Development;Database;
StartupWMClass=app
DESKTOP
  need fusermount || need fusermount3 || say "Note: AppImages need FUSE (libfuse2). Install it if Stroke doesn't start."
  say "Installed ~/.local/bin/stroke"
  case ":$PATH:" in *":$HOME/.local/bin:"*) ;; *) say "Add ~/.local/bin to your PATH to run 'stroke' from a terminal." ;; esac
}

case "$FAMILY" in
  *arch*|*manjaro*|*endeavouros*)
    if [ "$CHANNEL" = "stable" ] && { need yay || need paru; }; then
      AUR="yay"; need yay || AUR="paru"
      if curl -fsS -o /dev/null "https://aur.archlinux.org/cgit/aur.git/plain/PKGBUILD?h=stroke-bin"; then
        say "Installing stroke-bin from the AUR with $AUR"
        "$AUR" -S --needed stroke-bin
        exit 0
      fi
    fi
    install_appimage ;;
  *debian*|*ubuntu*)
    say "Downloading the .deb ($TAG)"
    fetch "$TMP/stroke.deb" "$BASE/$DEB"
    $SUDO apt-get install -y "$TMP/stroke.deb"
    say "Installed. Open Stroke from your applications menu." ;;
  *fedora*|*rhel*|*centos*|*suse*)
    if [ -n "$RPM" ]; then
      say "Downloading the .rpm ($TAG)"
      fetch "$TMP/stroke.rpm" "$BASE/$RPM"
      if need dnf; then $SUDO dnf install -y "$TMP/stroke.rpm"; else $SUDO zypper --non-interactive install --allow-unsigned-rpm "$TMP/stroke.rpm"; fi
      say "Installed. Open Stroke from your applications menu."
    else
      install_appimage
    fi ;;
  *) install_appimage ;;
esac
