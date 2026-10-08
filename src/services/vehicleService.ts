import { getVehicles } from '@/mocks'
import { STORAGE_KEYS, setItem } from '@/storage/localStorageRepository'
import type { Vehicle } from '@/types'
import { formatPlate, generateId, normalizeSearch, nowISO } from '@/utils/format'

function save(vehicles: Vehicle[]) {
  setItem(STORAGE_KEYS.vehicles, vehicles)
}

export const vehicleService = {
  list(): Vehicle[] {
    return getVehicles().sort((a, b) => a.plate.localeCompare(b.plate))
  },

  getById(id: string): Vehicle | undefined {
    return getVehicles().find((v) => v.id === id)
  },

  getByPlate(plate: string): Vehicle | undefined {
    const normalized = formatPlate(plate)
    return getVehicles().find((v) => v.plate === normalized)
  },

  getByCustomer(customerId: string): Vehicle[] {
    return this.list().filter((v) => v.customerId === customerId)
  },

  search(query: string): Vehicle[] {
    const q = normalizeSearch(query)
    if (!q) return this.list()
    return this.list().filter((v) => {
      const hay = normalizeSearch(`${v.plate} ${v.brand} ${v.model} ${v.color} ${v.year ?? ''}`)
      return hay.includes(q)
    })
  },

  create(data: Omit<Vehicle, 'id' | 'createdAt' | 'plate'> & { plate: string }): Vehicle {
    const vehicles = getVehicles()
    const vehicle: Vehicle = {
      ...data,
      plate: formatPlate(data.plate),
      id: generateId('veh'),
      createdAt: nowISO(),
    }
    vehicles.push(vehicle)
    save(vehicles)
    return vehicle
  },

  update(id: string, data: Partial<Vehicle>): Vehicle | undefined {
    const vehicles = getVehicles()
    const index = vehicles.findIndex((v) => v.id === id)
    if (index < 0) return undefined
    const plate = data.plate ? formatPlate(data.plate) : vehicles[index].plate
    vehicles[index] = { ...vehicles[index], ...data, plate, id }
    save(vehicles)
    return vehicles[index]
  },

  remove(id: string): boolean {
    const vehicles = getVehicles()
    const next = vehicles.filter((v) => v.id !== id)
    if (next.length === vehicles.length) return false
    save(next)
    return true
  },
}
