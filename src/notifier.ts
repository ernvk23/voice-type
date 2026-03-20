import { spawn } from "child_process"
import type { Urgency } from "./types"

const SOUNDS = {
    START: "/usr/share/sounds/freedesktop/stereo/dialog-warning.oga",
    DAEMON_START: "/usr/share/sounds/freedesktop/stereo/message-new-instant.oga",
    STOP: "/usr/share/sounds/freedesktop/stereo/power-unplug.oga",
    ERROR: "/usr/share/sounds/freedesktop/stereo/dialog-error.oga",
}

export default class Notifier {
    private textNotifsEnabled = true
    private soundsNotifsEnabled = true
    private readonly NOTIFY_ID = 42069 // arbitrary integer so that new notifs replace old one (in libnotify)

    constructor(opts: { textNotifsEnabled?: boolean; soundsNotifsEnabled?: boolean }) {
        if (opts.textNotifsEnabled !== undefined) this.textNotifsEnabled = opts.textNotifsEnabled
        if (opts.soundsNotifsEnabled !== undefined) this.soundsNotifsEnabled = opts.soundsNotifsEnabled
    }

    private notifyText(
        title: string,
        message: string,
        icon: string,
        urgency: Urgency = "normal",
        durationMs: number = 1000,
    ) {
        if (!this.textNotifsEnabled) return
        const args = [
            "-r",
            String(this.NOTIFY_ID),
            "-a",
            "Wraith",
            "-u",
            urgency,
            "-i",
            icon,
            "-t",
            String(durationMs),
            "--transient",
            title,
            message,
        ]
        spawn("notify-send", args)
    }

    private notifySound(audioPath: string) {
        if (!this.soundsNotifsEnabled || !audioPath) return
        spawn("paplay", [audioPath])
    }

    // --- Specialized Notifiers ---

    public notifyDaemonStart(hotkey: string = "F9") {
        this.notifyText(
            "👻 Wraith Daemon Active",
            `Ready to transcribe. Press ${hotkey} to start.`,
            "microphone-sensitivity-high",
            "normal",
        )
        this.notifySound(SOUNDS.DAEMON_START)
    }

    public notifyMicStart() {
        this.notifyText(
            "🟢 Wraith Listening...",
            "Typing into the focused window.",
            "microphone-sensitivity-high",
            "normal",
        )
        this.notifySound(SOUNDS.START)
    }

    public notifyMicStop() {
        this.notifyText(
            "🛑 Wraith Stopped",
            "Microphone closed. Text finalized.",
            "microphone-sensitivity-muted",
            "normal",
        )
        this.notifySound(SOUNDS.STOP)
    }

    public notifyOffline() {
        this.notifyText(
            "📡 Connection Error",
            "WSA requires internet to transcribe speech.",
            "network-error",
            "critical",
        )
        this.notifySound(SOUNDS.ERROR)
    }

    public notifyError(msg: string) {
        this.notifyText("⚠️ Wraith Error", msg, "dialog-error", "critical")
        this.notifySound(SOUNDS.ERROR)
    }
}
