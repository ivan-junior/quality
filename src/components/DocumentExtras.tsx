import QRCode from 'react-qr-code'
import type { CompanySettings } from '@/types'

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function DocumentReviewQr({ settings }: { settings: CompanySettings }) {
  const url = settings.googleReviewUrl?.trim()
  if (!url || !isValidHttpUrl(url)) return null

  return (
    <section className="mt-8 flex flex-col items-center gap-3 border border-neutral-300 p-4 text-center">
      <p className="text-sm font-bold">Gostou do nosso atendimento?</p>
      <p className="text-sm">Avalie a {settings.name}!</p>
      <div className="rounded bg-white p-2">
        <QRCode value={url} size={128} level="M" bgColor="#FFFFFF" fgColor="#000000" />
      </div>
      <p className="text-xs text-neutral-600">Escaneie para deixar sua avaliação.</p>
    </section>
  )
}

export function DocumentSocialFooter({ settings }: { settings: CompanySettings }) {
  const links = [
    settings.instagram ? { label: 'Instagram', value: settings.instagram } : null,
    settings.facebook ? { label: 'Facebook', value: settings.facebook } : null,
    settings.website ? { label: 'Site', value: settings.website } : null,
    settings.whatsapp ? { label: 'WhatsApp', value: settings.whatsapp } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>

  if (!links.length && !settings.address && !settings.phone) {
    return (
      <footer className="mt-8 border-t border-neutral-300 pt-3 text-center text-xs text-neutral-600">
        <p>{settings.name}</p>
        {settings.phone ? <p>Tel: {settings.phone}</p> : null}
      </footer>
    )
  }

  return (
    <footer className="mt-8 border-t border-neutral-300 pt-3 text-center text-xs text-neutral-600">
      <p className="font-semibold text-neutral-800">{settings.name}</p>
      {settings.address ? <p>{settings.address}</p> : null}
      {settings.phone ? <p>Tel: {settings.phone}</p> : null}
      {links.length > 0 ? (
        <p className="mt-1">
          {links.map((l, i) => (
            <span key={l.label}>
              {i > 0 ? ' · ' : ''}
              {l.label}: {l.value}
            </span>
          ))}
        </p>
      ) : null}
    </footer>
  )
}
