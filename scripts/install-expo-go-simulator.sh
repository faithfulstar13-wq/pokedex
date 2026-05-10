#!/usr/bin/env bash
set -euo pipefail
# Installs Expo Go (SDK 54) on the currently booted iOS Simulator.
# Requires: Xcode + Simulator, curl. Run: bash scripts/install-expo-go-simulator.sh

SDK_TAR_URL="https://github.com/expo/expo-go-releases/releases/download/Expo-Go-54.0.6/Expo-Go-54.0.6.tar.gz"
APP="/tmp/Expo Go.app"

if ! xcrun simctl list devices booted 2>/dev/null | grep -q "(Booted)"; then
  echo "No booted simulator. Opening Simulator — boot a device (e.g. iPhone), then run this script again."
  open -a Simulator
  exit 1
fi

rm -rf "$APP"
mkdir -p "$APP"
echo "Downloading Expo Go for iOS Simulator (SDK 54)..."
curl -sSL -o /tmp/expo-go-54.tar.gz "$SDK_TAR_URL"
tar -xzf /tmp/expo-go-54.tar.gz -C "$APP"
echo "Installing on booted simulator..."
xcrun simctl install booted "$APP"
echo "Launching Expo Go..."
xcrun simctl launch booted host.exp.Exponent
open -a Simulator
echo "Expo Go is installed and was launched."
