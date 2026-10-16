import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface NumberInputProps
  extends Omit<React.ComponentProps<'input'>, 'type' | 'value' | 'onChange' | 'defaultValue'> {
  value: number | null | undefined
  onValueChange: (value: number | null) => void
  allowEmpty?: boolean
  allowDecimal?: boolean
  min?: number
  max?: number
  emptyAsNull?: boolean
}

function toDisplay(value: number | null | undefined, allowEmpty: boolean): string {
  if (value == null || Number.isNaN(value)) {
    return allowEmpty ? '' : '0'
  }
  return String(value)
}

function parseInput(raw: string, allowDecimal: boolean): number | null {
  const trimmed = raw.trim().replace(',', '.')
  if (trimmed === '' || trimmed === '-' || trimmed === '.' || trimmed === '-.') {
    return null
  }
  if (!allowDecimal && trimmed.includes('.')) {
    const intPart = trimmed.split('.')[0]
    if (intPart === '' || intPart === '-') return null
    const n = Number(intPart)
    return Number.isFinite(n) ? n : null
  }
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onValueChange,
      allowEmpty = true,
      allowDecimal = true,
      min = 0,
      max,
      emptyAsNull = false,
      className,
      onBlur,
      onFocus,
      ...props
    },
    ref,
  ) => {
    const [text, setText] = React.useState(() => toDisplay(value, allowEmpty))
    const [focused, setFocused] = React.useState(false)

    React.useEffect(() => {
      if (!focused) {
        setText(toDisplay(value, allowEmpty))
      }
    }, [value, allowEmpty, focused])

    function clamp(n: number): number {
      let result = n
      if (min != null && result < min) result = min
      if (max != null && result > max) result = max
      return result
    }

    function commit(raw: string) {
      const parsed = parseInput(raw, allowDecimal)
      if (parsed == null) {
        if (allowEmpty && emptyAsNull) {
          onValueChange(null)
          setText('')
          return
        }
        const fallback = min != null ? min : 0
        onValueChange(fallback)
        setText(String(fallback))
        return
      }
      const clamped = clamp(parsed)
      onValueChange(clamped)
      setText(String(clamped))
    }

    return (
      <Input
        ref={ref}
        type="text"
        inputMode={allowDecimal ? 'decimal' : 'numeric'}
        className={cn(className)}
        value={text}
        onFocus={(e) => {
          setFocused(true)
          onFocus?.(e)
        }}
        onChange={(e) => {
          const raw = e.target.value
          if (raw === '') {
            setText('')
            if (allowEmpty) {
              onValueChange(emptyAsNull ? null : null)
            }
            return
          }
          const pattern = allowDecimal ? /^-?\d*[.,]?\d*$/ : /^-?\d*$/
          if (!pattern.test(raw)) return
          setText(raw)
          const parsed = parseInput(raw, allowDecimal)
          if (parsed != null) {
            onValueChange(parsed)
          } else if (allowEmpty) {
            onValueChange(null)
          }
        }}
        onBlur={(e) => {
          setFocused(false)
          commit(e.target.value)
          onBlur?.(e)
        }}
        {...props}
      />
    )
  },
)
NumberInput.displayName = 'NumberInput'
