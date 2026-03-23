# Voice Type

System-wide Speech-to-Text for Linux. Press a key, speak, done - text lands wherever you're focused. Free, fast, private.

**How it works:** Chrome runs quietly in the background using its built-in Web Speech API. No local models, no paid services, no startup lag.

---

## Prerequisites

**Flatpak:** `flatpak-builder` (the build script installs all required SDKs automatically)

**Binary:** Google Chrome, dotool, libnotify, pulseaudio-utils

---

## Install

### Flatpak (Recommended)

```bash
git clone https://github.com/E-nkv/voice-type.git
cd voice-type
chmod +x ./flatpak/build.sh && ./flatpak/build.sh
```

### Binary

```bash
curl -fsSL https://github.com/E-nkv/voice-type/releases/latest/download/install.sh | bash
```

---

## Usage

Start the daemon - it runs in the background and logs to the console.

**Flatpak**
```bash
flatpak run org.voice_type.VoiceType &
```

**Binary**
```bash
voice-type &
```

Then click into any text field and use your shortcuts or curl directly:

```bash
curl http://127.0.0.1:3232/start
curl http://127.0.0.1:3232/stop
```

Force kill if needed:

**Flatpak**
```bash
sh -c "flatpak kill org.voice_type.VoiceType 2>/dev/null; rm -rf /tmp/voice-type-browser"
```

**Binary**
```bash
sh -c "pkill -f voice-type 2>/dev/null; rm -rf /tmp/voice-type-browser"
```

---

## Keyboard Shortcuts

Bind in your system settings (e.g. GNOME Settings -> Keyboard -> Custom Shortcuts).

**Flatpak**
```bash
# F9  - start daemon
sh -c "flatpak ps | grep -q VoiceType || flatpak run org.voice_type.VoiceType"
# F10 - stop daemon
sh -c "flatpak kill org.voice_type.VoiceType 2>/dev/null; rm -rf /tmp/voice-type-browser"
# F11 - start dictation
curl http://127.0.0.1:3232/start
# F12 - stop dictation
curl http://127.0.0.1:3232/stop
```

**Binary**
```bash
# F9  - start daemon
sh -c "pgrep -f voice-type || voice-type"
# F10 - stop daemon
sh -c "pkill -f voice-type 2>/dev/null; rm -rf /tmp/voice-type-browser"
# F11 - start dictation
curl http://127.0.0.1:3232/start
# F12 - stop dictation
curl http://127.0.0.1:3232/stop
```

---

## Uninstall

### Flatpak

```bash
flatpak uninstall --user org.voice_type.VoiceType
rm -rf ~/.var/app/org.voice_type.VoiceType .flatpak-builder flatpak/build flatpak/repo
rm -f /tmp/voice-type-browser
```

> [!TIP]
> Optionally remove SDKs pulled in by Voice Type. Flatpak will warn if other apps still need them.
> ```bash
> flatpak uninstall --user org.electronjs.Electron2.BaseApp//24.08 org.freedesktop.Sdk.Extension.golang//24.08
> ```

### Binary

```bash
sudo rm /usr/local/bin/voice-type
sudo rm -rf /usr/local/share/voice-type
rm -f /tmp/voice-type-browser
```

---

## Development

```bash
bun install && bun run ./src/index.ts
```

Contributions welcome - bugs, docs, features, PRs, all good.