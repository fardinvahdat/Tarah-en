// Global Error Handler for preventing automatic reloads
import { ElMessage } from 'element-plus'

export interface ErrorInfo {
  message: string
  stack?: string
  componentStack?: string
  timestamp: number
  userAgent: string
  url: string
  userId?: string
}

class GlobalErrorHandler {
  private errorQueue: ErrorInfo[] = []
  private maxErrors = 50
  private isProduction = import.meta.env.MODE === 'production'

  init() {
    // Handle uncaught JavaScript errors
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('🚨 Uncaught Error:', { message, source, lineno, colno, error })
      
      this.logError({
        message: `${message} at ${source}:${lineno}:${colno}`,
        stack: error?.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })

      // Prevent default browser reload behavior
      return true
    }

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason)
      
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })

      // Prevent default browser reload behavior
      event.preventDefault()
    })

    // Handle PWA update errors
    window.addEventListener('pwa-update-error', (event: any) => {
      console.error('🚨 PWA Update Error:', event.detail)
      this.handlePWAError(event.detail)
    })

    // Handle memory warnings
    window.addEventListener('memory:cleanup', () => {
      this.performMemoryCleanup()
    })

    // Mobile-specific error handling
    if (this.isMobileDevice()) {
      this.setupMobileErrorHandling()
    }
  }

  private logError(errorInfo: ErrorInfo) {
    this.errorQueue.push(errorInfo)
    
    // Keep only last N errors
    if (this.errorQueue.length > this.maxErrors) {
      this.errorQueue.shift()
    }

    // Show user-friendly message
    if (!this.isProduction) {
      ElMessage.error(`خطا: ${errorInfo.message.substring(0, 100)}...`)
    }

    // Send to analytics/logging service in production
    if (this.isProduction) {
      this.sendErrorToService(errorInfo)
    }
  }

  private handlePWAError(error: any) {
    console.warn('PWA Error handled, preventing reload')
    ElMessage.warning('Update has a problem, please update the page')
  }

  private performMemoryCleanup() {
    console.log('🧹 Performing memory cleanup...')
    
    // Trigger garbage collection if available
    if (window.gc) {
      window.gc()
    }

    // Clear image caches
    window.dispatchEvent(new CustomEvent('canvas:cleanup-cache'))
    
    // Clear old error logs
    this.errorQueue = this.errorQueue.slice(-10)
  }

  private setupMobileErrorHandling() {
    // Handle touch event errors
    document.addEventListener('touchstart', (event) => {
      try {
        // Prevent default if needed
      } catch (error) {
        this.logError({
          message: `Touch event error: ${error}`,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }
    }, { passive: true })

    // Handle orientation change errors
    window.addEventListener('orientationchange', () => {
      try {
        // Debounce canvas resize
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('canvas:orientation-change'))
        }, 500)
      } catch (error) {
        this.logError({
          message: `Orientation change error: ${error}`,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }
    })

    // Handle visibility change to prevent reload on app switch
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // App went to background, save state
        window.dispatchEvent(new CustomEvent('app:background'))
      } else {
        // App came to foreground, restore state
        window.dispatchEvent(new CustomEvent('app:foreground'))
      }
    })
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  private async sendErrorToService(errorInfo: ErrorInfo) {
    // Implement your error reporting service here
    console.log('📊 Error logged for analytics:', errorInfo)
  }

  getErrorHistory(): ErrorInfo[] {
    return [...this.errorQueue]
  }

  clearErrorHistory() {
    this.errorQueue = []
  }
}

export const globalErrorHandler = new GlobalErrorHandler()
