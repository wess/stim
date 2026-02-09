#!/bin/sh
set -e

REPO="wess/stim"
INSTALL_DIR="/usr/local/bin"
BINARY="stim"

main() {
  os=$(uname -s | tr '[:upper:]' '[:lower:]')
  arch=$(uname -m)

  case "$os" in
    darwin) platform="darwin" ;;
    linux)  platform="linux" ;;
    *)
      echo "Error: unsupported OS: $os"
      exit 1
      ;;
  esac

  case "$arch" in
    x86_64|amd64) arch="x64" ;;
    arm64|aarch64) arch="arm64" ;;
    *)
      echo "Error: unsupported architecture: $arch"
      exit 1
      ;;
  esac

  if [ "$platform" = "linux" ] && [ "$arch" = "arm64" ]; then
    echo "Error: linux arm64 builds are not yet available"
    exit 1
  fi

  asset="${BINARY}-${platform}-${arch}"
  url="https://github.com/${REPO}/releases/latest/download/${asset}"

  echo "Installing stim (${platform}/${arch})..."

  tmpdir=$(mktemp -d)
  trap 'rm -rf "$tmpdir"' EXIT

  echo "Downloading ${url}..."
  if command -v curl > /dev/null 2>&1; then
    curl -fsSL "$url" -o "${tmpdir}/${BINARY}"
  elif command -v wget > /dev/null 2>&1; then
    wget -q "$url" -O "${tmpdir}/${BINARY}"
  else
    echo "Error: curl or wget is required"
    exit 1
  fi

  chmod +x "${tmpdir}/${BINARY}"

  if [ -w "$INSTALL_DIR" ]; then
    mv "${tmpdir}/${BINARY}" "${INSTALL_DIR}/${BINARY}"
  else
    echo "Installing to ${INSTALL_DIR} (requires sudo)..."
    sudo mv "${tmpdir}/${BINARY}" "${INSTALL_DIR}/${BINARY}"
  fi

  echo "Installed stim to ${INSTALL_DIR}/${BINARY}"
  echo ""
  stim version
}

main
