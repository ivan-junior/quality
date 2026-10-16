import { toast } from 'sonner'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildWhatsAppUrl } from '@/utils/whatsapp'

interface WhatsAppShareButtonProps {
  phone: string
  message: string
  label?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showHint?: boolean
}

export function WhatsAppShareButton({
  phone,
  message,
  label = 'Enviar pelo WhatsApp',
  variant = 'outline',
  size = 'sm',
  className,
  showHint = true,
}: WhatsAppShareButtonProps) {
  function handleClick() {
    const url = buildWhatsAppUrl(phone, message)
    if (!url) {
      toast.error('Telefone/WhatsApp inválido. Verifique o cadastro do cliente.')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
    if (showHint) {
      toast.message('WhatsApp aberto', {
        description: 'Baixe o PDF e anexe manualmente na conversa, se desejar.',
      })
    }
  }

  return (
    <Button type="button" variant={variant} size={size} className={className} onClick={handleClick}>
      <MessageCircle className="h-4 w-4" />
      {label}
    </Button>
  )
}
