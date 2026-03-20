import Notifier from "../notifier.js"

const not = new Notifier({})

// Test each notification individually by uncommenting and running

export async function testDaemonStart() {
    not.notifyDaemonStart("F9")
}

export async function testMicStart() {
    not.notifyMicStart()
}

export async function testMicStop() {
    not.notifyMicStop()
}

export async function testOffline() {
    not.notifyOffline()
}

export async function testError() {
    not.notifyError("Test error message")
}

// Helper function for delays
async function zzz(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

// Run individual tests by uncommenting:
async function m() {
    //testOffline()
    //testCooldown()
    //testError()
    await testDaemonStart()
    await zzz(5000)
}

m().catch(console.error)
