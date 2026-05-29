import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export function roomUrl(code: string): string {
  return `${window.location.origin}${window.location.pathname}#${code}`
}

export function ShareSheet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const url = roomUrl(code)

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'TAPROOM', text: 'Join my TAPROOM game', url })
        return
      } catch {
        return // user dismissed the share sheet
      }
    }
    void copy()
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-2xl bg-foam p-3">
        <QRCodeSVG value={url} size={148} bgColor="transparent" fgColor="#17110C" level="M" />
      </div>
      <div className="text-center">
        <p className="text-xs uppercase tracking-wide text-ink-low">Room code</p>
        <p className="font-display text-3xl tracking-[0.2em] text-amber text-glow-amber">{code}</p>
      </div>
      <div className="flex w-full gap-2">
        <button
          onClick={share}
          className="flex-1 rounded-xl bg-amber px-4 py-3 font-signage text-pit active:scale-[0.97]"
        >
          Share link
        </button>
        <button
          onClick={copy}
          className="flex-1 rounded-xl border border-line bg-panel px-4 py-3 font-semibold text-ink active:scale-[0.97]"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
