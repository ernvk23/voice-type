import puppeteer from "puppeteer"
import { initWSA, startListening, stopListening } from "./browser.js"
import express, { type Express } from "express"
import { log } from "./logger.js"
import { spawn, type ChildProcessWithoutNullStreams } from "child_process"

enum DiffEnum {
    NoChange = "NO_CHANGE",
    ChangeBoth = "CHANGE_BOTH",
    ChangeInterim = "CHANGE_INTERIM",
    ChangeBothAndClearTotal = "CHANGE_BOTH_AND_CLEAR_TOTAL",
}
process.title = "Wraith-server"
const PORT = process.env.PORT || 3232

class TypingController {
    private prevInterim: string = ""

    //
    calculateDiff(currInterim: string): DiffEnum {
        const sameInterim = currInterim.length == this.prevInterim.length
        if (sameInterim) return DiffEnum.NoChange
        else {
        }

        return DiffEnum.NoChange
    }
}

class Daemon {
    private browser: puppeteer.Browser | null = null
    private page: puppeteer.Page | null = null
    private isWSAListening: boolean = false
    private app: Express
    private dotool: ChildProcessWithoutNullStreams
    private diffCalculator: TypingController = new TypingController()

    constructor() {
        this.app = express()
        this.setupRoutes()
        this.dotool = this.initDotool()
    }

    private initDotool() {
        const dotool = spawn("dotool")
        dotool.stderr.on("data", (data) => {
            const lines = data.toString().split("\n").filter(Boolean)
            for (const line of lines) {
                console.log(`[DOTOOL] ${line}`)
            }
        })
        dotool.on("exit", (code, signal) => {
            log(`dotool exited with code [${code}] and signal [${signal}]`)
        })

        return dotool
    }
    private insertText(text: string) {
        if (!this.dotool.stdin.writable) {
            log("dotool stdin not writable")
            return
        }
        this.dotool.stdin.write(`type ${text} \n`)
    }

    private setupRoutes() {
        this.app.get("/start", async (req, res) => {
            if (!this.isBrowserReady()) {
                log("Browser not ready - cannot start transcription")
                return
            }
            if (this.isWSAListening) {
                log("Already listening.")
                return
            }
            log("Starting transcription...")
            this.isWSAListening = true
            await this.page!.evaluate(startListening)
        })

        this.app.get("/stop", async (req, res) => {
            if (!this.isBrowserReady()) {
                log("Browser not ready - cannot stop transcription")
                return
            }
            if (!this.isWSAListening) {
                log("Cannot call stop before start")
                return
            }
            log("Stopping transcription...")
            this.isWSAListening = false
            await this.page!.evaluate(stopListening)
        })
    }

    private isBrowserReady(): boolean {
        return this.page !== null && this.browser !== null
    }

    private async initBrowser() {
        this.browser = await puppeteer.launch({
            executablePath: "/usr/bin/google-chrome-stable",
            // @ts-ignore
            headless: "new",
            args: [
                "--use-fake-ui-for-media-stream",
                "--disable-background-timer-throttling",
                "--user-data-dir=/tmp/stt-chrome-profile",
                "--log-level=0",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-software-rasterizer",
                "--disable-background-networking",
                "--disable-default-apps",
                "--disable-extensions",
                "--disable-sync",
                "--disable-translate",
                "--metrics-recording-only",
                "--no-first-run",
                "--safebrowsing-disable-auto-update",
                "--disable-features=IsolateOrigins,site-per-process",
            ],
            name: "Wraith-browser",
        })

        this.page = await this.browser.newPage()
        this.page.on("console", (msg) => console.log("[BROWSER]", msg.text()))

        await this.page.goto("data:text/html,<html><body><h1>Wraith</h1></body></html>")
        await this.page.exposeFunction("onSpeechUpdate", this.handleSpeechUpdate.bind(this))
        await this.page.exposeFunction("onSpeechError", this.handleSpeechError.bind(this))
        await this.page.evaluate(initWSA)
    }

    private handleSpeechUpdate(payload: { totalText: string; interimResults: string }) {
        log(`Total: "${payload.totalText}", Interim: "${payload.interimResults}"`)
        const fullStr = payload.totalText + " " + payload.interimResults
        log(`len: ${fullStr.length}`)
    }

    private handleSpeechError(payload: { error: string; message: string }) {
        const isWarning = ["network", "not-allowed", "permission-denied"].includes(payload.error)
        log(`${isWarning ? "WARNING" : "ERROR"}: ${payload.message}`)
    }

    //start spawns browser and server listener
    public async start(port: number | string) {
        await this.initBrowser()

        this.app.listen(port, () => {
            log(`SERVER STARTED ON PORT: ${port}`)
        })
    }

    async testInsertion() {
        this.insertText("hello world")
        this.insertText("I am indee")
        this.insertText("very careful")
        await new Promise((res) => setTimeout(res, 1000))
        this.dotool.kill("SIGTERM")
    }
}

const daemon = new Daemon()
//daemon.testInsertion().catch((e) => console.error)
daemon.start(PORT).catch(console.error)
