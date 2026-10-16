import { getCompanySettings } from '@/mocks'
import { DEFAULT_COMPANY_SETTINGS } from '@/lib/constants'
import { STORAGE_KEYS, setItem } from '@/storage/localStorageRepository'
import type { CompanySettings } from '@/types'

export const companySettingsService = {
  get(): CompanySettings {
    return getCompanySettings()
  },

  save(data: Partial<CompanySettings>): CompanySettings {
    const current = this.get()
    const next: CompanySettings = {
      ...DEFAULT_COMPANY_SETTINGS,
      ...current,
      ...data,
      logo: data.logo?.trim() || current.logo || DEFAULT_COMPANY_SETTINGS.logo,
      name: (data.name ?? current.name).trim() || DEFAULT_COMPANY_SETTINGS.name,
    }
    setItem(STORAGE_KEYS.companySettings, next)
    return next
  },
}
