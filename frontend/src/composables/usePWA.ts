
import { ref, onMounted, computed } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

export interface PWAUpdateInfo {
  isUpdateAvailable: boolean
  updateSW: () => Promise<void>
}

export interface PWAInstallInfo {
  isInstallable: boolean
  showInstallPrompt: () => Promise<void>
}

export interface PWANetworkInfo {
  isOnline: boolean
  connectionType: string
  effectiveType: string
}

export const usePWA = () => {
  const isInstallable = ref(false)
  const isUpdateAvailable = ref(false)
  const isOnline = ref(navigator.onLine)
  const installPromptEvent = ref<any>(null)
  const networkInfo = ref<PWANetworkInfo>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    effectiveType: 'unknown'
  })

  // Enhanced network information
  const updateNetworkInfo = () => {
    networkInfo.value = {
      isOnline: navigator.onLine,
      connectionType: (navigator as any).connection?.type || 'unknown',
      effectiveType: (navigator as any).connection?.effectiveType || 'unknown'
    }
  }

  // PWA Update handling with better user experience
  const {
    needRefresh,
    updateServiceWorker,
    offlineReady
  } = useRegisterSW({
    onNeedRefresh() {
      isUpdateAvailable.value = true
      // Show user-friendly update notification
      showUpdateNotification()
    },
    onOfflineReady() {
      console.log('App ready to work offline')
      showOfflineReadyNotification()
    },
    onRegistered(r) {
      console.log('SW Registered: ' + r)
      // Set up periodic update checks
      setupPeriodicUpdateCheck(r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    }
  })

  // Enhanced install prompt handling
  const handleInstallPrompt = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      installPromptEvent.value = e
      isInstallable.value = true
      
      // Store install prompt availability
      localStorage.setItem('pwa-installable', 'true')
    })

    // Handle successful installation
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed')
      isInstallable.value = false
      installPromptEvent.value = null
      localStorage.setItem('pwa-installed', 'true')
      
      // Show success message
      showInstallSuccessNotification()
    })
  }

  const showInstallPrompt = async () => {
    if (installPromptEvent.value) {
      try {
        installPromptEvent.value.prompt()
        const result = await installPromptEvent.value.userChoice
        
        if (result.outcome === 'accepted') {
          console.log('User accepted the install prompt')
          isInstallable.value = false
        } else {
          console.log('User dismissed the install prompt')
        }
        
        installPromptEvent.value = null
      } catch (error) {
        console.error('Install prompt failed:', error)
      }
    }
  }

  // Enhanced online/offline handling
  const handleNetworkChange = () => {
    const updateOnlineStatus = () => {
      isOnline.value = navigator.onLine
      updateNetworkInfo()
      
      if (navigator.onLine) {
        handleOnlineReconnection()
      } else {
        handleOfflineMode()
      }
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    // Monitor connection changes
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', updateNetworkInfo)
    }
  }

  // Handle reconnection logic
  const handleOnlineReconnection = () => {
    console.log('Back online - syncing data...')
    
    // Trigger background sync if available
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('background-sync-upload')
      }).catch(error => {
        console.error('Background sync registration failed:', error)
      })
    }
    
    // Dispatch custom event for app to handle
    window.dispatchEvent(new CustomEvent('pwa-online-reconnection'))
  }

  const handleOfflineMode = () => {
    console.log('Gone offline - enabling offline mode')
    window.dispatchEvent(new CustomEvent('pwa-offline-mode'))
  }

  // Update service worker with user feedback (prevent reload if unsaved changes)
  const updateSW = async () => {
    try {
      // Check for unsaved changes before updating
      const hasUnsavedChanges = document.querySelector('.canvas-container')?.hasAttribute('data-modified')
      
      if (hasUnsavedChanges) {
        // Show warning instead of forcing update
        showUpdateWarningNotification()
        return
      }
      
      await updateServiceWorker(true)
      isUpdateAvailable.value = false
      
      // Show success notification
      showUpdateSuccessNotification()
    } catch (error) {
      console.error('Failed to update service worker:', error)
      showUpdateErrorNotification()
    }
  }

  // Periodic update checking (less aggressive to prevent reload loops)
  const setupPeriodicUpdateCheck = (registration: ServiceWorkerRegistration) => {
    // Only check for updates every 10 minutes to prevent reload loops
    setInterval(() => {
      // Don't check for updates if we're in the middle of design work
      if (!window.location.pathname.includes('/studio') || 
          !document.querySelector('.canvas-container')?.hasAttribute('data-modified')) {
        registration.update()
      }
    }, 600000) // Check every 10 minutes instead of 1 minute
  }

  // App state management
  const isStandalone = computed(() => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  })

  const canInstall = computed(() => {
    return isInstallable.value && !isStandalone.value && !isPWAInstalled.value
  })

  const isPWAInstalled = computed(() => {
    return localStorage.getItem('pwa-installed') === 'true' || isStandalone.value
  })

  // Notification helpers
  const showUpdateNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('بروزرسانی جدید', {
        body: 'نسخه جدید برنامه در دسترس است',
        icon: '/pwa-192x192.png',
        tag: 'update-available'
      })
    }
  }

  const showOfflineReadyNotification = () => {
    console.log('App cached and ready for offline use')
  }

  const showInstallSuccessNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('نصب موفق', {
        body: 'برنامه طراح با موفقیت نصب شد',
        icon: '/pwa-192x192.png',
        tag: 'install-success'
      })
    }
  }

  const showUpdateSuccessNotification = () => {
    console.log('App successfully updated')
  }

  const showUpdateErrorNotification = () => {
    console.error('Failed to update app')
  }

  const showUpdateWarningNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('بروزرسانی در انتظار', {
        body: 'لطفاً کار خود را ذخیره کنید تا بروزرسانی اعمال شود',
        icon: '/pwa-192x192.png',
        tag: 'update-warning'
      })
    }
  }

  // Storage management
  const getStorageUsage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        return {
          used: estimate.usage || 0,
          quota: estimate.quota || 0,
          percentage: estimate.quota ? Math.round((estimate.usage || 0) / estimate.quota * 100) : 0
        }
      } catch (error) {
        console.error('Storage estimate failed:', error)
        return null
      }
    }
    return null
  }

  const clearAppCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
      }
      
      // Clear IndexedDB data
      if ('indexedDB' in window) {
        // Implementation would depend on your IndexedDB structure
      }
      
      console.log('App cache cleared')
      return true
    } catch (error) {
      console.error('Failed to clear cache:', error)
      return false
    }
  }

  onMounted(() => {
    handleInstallPrompt()
    handleNetworkChange()
    updateNetworkInfo()
  })

  return {
    // State
    isInstallable: canInstall,
    isUpdateAvailable: needRefresh,
    isOnline,
    offlineReady,
    networkInfo: readonly(networkInfo),
    isStandalone,
    isPWAInstalled,
    
    // Actions
    showInstallPrompt,
    updateSW,
    getStorageUsage,
    clearAppCache
  }
}
