export type MaintenanceSettings = { enabled: boolean; message: string }

const DEFAULT_MESSAGE = 'Le site est temporairement indisponible afin d’effectuer quelques améliorations. Merci de votre patience.'

export const useMaintenance = () => {
  const settings = useState<MaintenanceSettings>('site-maintenance', () => ({ enabled: false, message: DEFAULT_MESSAGE }))

  async function refresh() {
    try {
      const result = await $fetch<{ maintenanceMode: boolean; maintenanceMessage?: string }>('/api/maintenance')
      settings.value = {
        enabled: Boolean(result.maintenanceMode),
        message: result.maintenanceMessage || DEFAULT_MESSAGE,
      }
    } catch {
      settings.value = { enabled: false, message: DEFAULT_MESSAGE }
    }
  }

  function update(enabled: boolean, message: string) {
    settings.value = { enabled, message: message || DEFAULT_MESSAGE }
  }

  return { settings, refresh, update, defaultMessage: DEFAULT_MESSAGE }
}
