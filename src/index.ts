import puppeteer from "puppeteer"
import { initWSA } from "./wsa.js"
import express, { type Express } from "express"

const PORT = process.env.PORT || "3232"

main().catch(console.error)

async function main() {
    const { browser, page } = await initBrowser()

    const app = initApp()
    app.listen(PORT, () => {
        console.log(`SERVER STARTED ON PORT: `, PORT)
    })

    await page.exposeFunction("onSpeechUpdate", handleSpeechUpdate)
    await page.evaluate(initWSA)
}

function initApp() {
    const app: Express = express()
    app.get("/start", (req, res) => {
        res.send("start")
    })
    return app
}

async function initBrowser() {
    const browser = await puppeteer.launch({
        executablePath: "/usr/bin/google-chrome-stable",
        //@ts-ignore
        headless: "new", // CRITICAL: Use the "new" headless mode, not true/false
        args: [
            "--use-fake-ui-for-media-stream", // CRITICAL: Auto-grants microphone permission
            "--disable-background-timer-throttling",
            // "--no-sandbox", // Uncomment ONLY if Wayland throws a strict sandbox error
        ],
    })

    const page = await browser.newPage()
    page.on("console", (msg) => console.log("[Browser]", msg.text()))

    // WSA fails sometimes on /about:blank
    await page.goto("data:text/html,<html><body><h1>STT Injector</h1></body></html>")

    return { browser, page }
}

async function handleSpeechUpdate(payload: { totalText: string; interimResults: string }) {
    console.log(`\n[NODE] Total: "${payload.totalText}", Interim: "${payload.interimResults}`)
}

async function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}
