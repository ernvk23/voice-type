import { spawn } from "bun"

export default class Notifier {
    private textNotifsEnabled = true
    private soundsNotifsEnabled = true

    constructor(opts: { textNotifsEnabled?: boolean; soundsNotifsEnabled?: boolean }) {
        if (opts.textNotifsEnabled) this.textNotifsEnabled = opts.textNotifsEnabled
        if (opts.soundsNotifsEnabled) this.soundsNotifsEnabled = opts.soundsNotifsEnabled
    }

    private notifyText(title: string, message: string, durationMs: number = 2000) {
        const args = ["notify-send", "-a", "Wraith", title, message]
        args.push("-t", String(durationMs))
        args.push("--transient")

        spawn(args)
    }
    private notifySound() {}

    public notify() {
        this.notifyText("", "")
        this.notifySound()
    }
}
