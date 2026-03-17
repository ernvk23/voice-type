// @ts-nocheck
export function initWSA() {
    console.log("initWSA script is running inside the browser!")

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRec) {
        console.error("FATAL: Web Speech API is not supported in this browser context.")
        return
    }

    const rec = new SpeechRec()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = "en-US"

    window.transcript = "" // Initialize the variable

    // Add lifecycle logs so we can see exactly what the mic is doing
    rec.onstart = () => console.log("Microphone is HOT! Waiting for audio...")
    rec.onaudiostart = () => console.log("Audio pipeline connected.")
    rec.onspeechstart = () => console.log("Human speech detected!")

    rec.onresult = (event) => {
        let currentInterim = ""
        let currentFinal = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                currentFinal += event.results[i][0].transcript
            } else {
                currentInterim += event.results[i][0].transcript
            }
        }

        // Append finalized text to our global buffer
        if (currentFinal) {
            window.transcript += currentFinal
        }
        if (window.onSpeechUpdate) {
            window.onSpeechUpdate({
                totalText: window.transcript,
                interimResults: currentInterim,
            })
        }
        //console.log(`[STT] Interim: "${currentInterim}" | Final Buffer: "${window.transcript}"`)
    }

    rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
    }

    rec.onend = () => {
        console.log("Recognition ended. Restarting...")
        try {
            rec.start()
        } catch (e) {
            console.error("Failed to restart:", e)
        }
    }
}
