#!/bin/sh
# Install Stroke: curl -fsSL https://stroke.click/install.sh | sh
#   Nightly:   curl -fsSL https://stroke.click/install.sh | sh -s -- --nightly
#
# macOS: Homebrew if present, otherwise the .dmg. Linux: the AUR on Arch
# (yay or paru: stroke-bin, or stroke-nightly-bin), the .deb on Debian and
# Ubuntu, the .rpm on Fedora and openSUSE, and the AppImage everywhere else,
# into ~/.local. Windows (Git Bash, MSYS2, Cygwin): Scoop if present,
# otherwise the installer. In PowerShell use:
#   irm https://stroke.click/install.ps1 | iex
set -eu

REPO="stroke-app/stroke"
CHANNEL="stable"
for arg in "$@"; do
  case "$arg" in
    --nightly) CHANNEL="nightly" ;;
    -h|--help) sed -n '2,12p' "$0" 2>/dev/null || true; exit 0 ;;
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
  EXE="stroke-nightly_x64-setup.exe"
else
  # GitHub's releases/latest redirects to the tag's page; reading the redirect
  # needs no API call, so it isn't caught by the API's 60-an-hour limit for
  # anonymous requests (a 403 on shared or busy IPs). The API is the fallback.
  TAG="$(curl -fsSLI -o /dev/null -w '%{url_effective}' "https://github.com/$REPO/releases/latest" 2>/dev/null | sed -n 's|.*/releases/tag/\([^/?#]*\).*|\1|p')"
  [ -n "$TAG" ] || TAG="$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" 2>/dev/null | sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p' | head -1)"
  [ -n "$TAG" ] || fail "couldn't find the latest release; check your connection"
  V="${TAG#v}"
  BASE="https://github.com/$REPO/releases/download/$TAG"
  DEB="stroke_${V}_amd64.deb"; RPM="stroke-${V}-1.x86_64.rpm"; APPIMAGE="stroke_${V}_amd64.AppImage"
  DMG_ARM="stroke_${V}_aarch64.dmg"; DMG_X64="stroke_${V}_x64.dmg"
  EXE="stroke_${V}_x64-setup.exe"
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

# ── Windows (Git Bash, MSYS2, Cygwin) ───────────────────────────────────────
case "$OS" in
  MINGW*|MSYS*|CYGWIN*)
    if [ "$CHANNEL" = "stable" ] && need scoop; then
      say "Installing Stroke with Scoop"
      scoop bucket list 2>/dev/null | grep -q '^ *stroke\b' || scoop bucket add stroke "https://github.com/$REPO"
      scoop install stroke/stroke
      say "Installed. Update it with: scoop update stroke"
      exit 0
    fi
    say "Downloading Stroke ($TAG)"
    fetch "$TMP/$EXE" "$BASE/$EXE"
    say "Installing"
    # Per-user installer; /S skips the wizard. Run from the shell, it waits.
    chmod +x "$TMP/$EXE" 2>/dev/null || true
    "$TMP/$EXE" /S
    say "Installed. Open Stroke from the Start menu."
    exit 0 ;;
esac

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
    if need yay || need paru; then
      AUR="yay"; need yay || AUR="paru"
      PKG="stroke-bin"; [ "$CHANNEL" = "nightly" ] && PKG="stroke-nightly-bin"
      if curl -fsS -o /dev/null "https://aur.archlinux.org/cgit/aur.git/plain/PKGBUILD?h=$PKG"; then
        say "Installing $PKG from the AUR with $AUR"
        # Under `curl | sh` stdin is this script, so prompts go to the
        # terminal; with no terminal at all, install without them.
        if (exec </dev/tty) 2>/dev/null; then
          "$AUR" -S --needed "$PKG" </dev/tty
        elif [ "$AUR" = "yay" ]; then
          yay -S --needed --noconfirm --answerdiff None --answerclean None "$PKG"
        else
          paru -S --needed --noconfirm --skipreview "$PKG"
        fi
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
