<template>
  <div class="pwa-notifications">
    <!-- Update Available Notification -->
    <Transition name="slide-up">
      <div
        v-if="isUpdateAvailable && !updateDismissed"
        class="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-green-600 to-green-500 text-white p-4 rounded-xl shadow-2xl border border-green-400"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="bg-green-500 rounded-full p-2 mr-3">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p class="font-bold text-sm">بان The new version is ready!</p>
              <p class="text-xs opacity-90 mt-1">
                New features and performance improvements
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="handleUpdate"
              :disabled="isUpdating"
              class="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-all duration-200 text-sm disabled:opacity-50"
            >
              <span v-if="!isUpdating">Update</span>
              <span v-else class="flex items-center">
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Updating ...
              </span>
            </button>
            <button
              @click="updateDismissed = true"
              class="text-white opacity-70 hover:opacity-100 transition-opacity p-1"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Install App Notification -->
    <Transition name="slide-up">
      <div
        v-if="showInstallBanner"
        class="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl shadow-2xl border border-blue-400"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="bg-blue-500 rounded-full p-2 mr-3">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                />
              </svg>
            </div>
            <div>
              <p class="font-bold text-sm">📱 Designer app installation</p>
              <p class="text-xs opacity-90 mt-1">
                Quick access from the phone's home screen
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="installApp"
              class="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200 text-sm"
            >
              Installation
            </button>
            <button
              @click="dismissInstall"
              class="text-white opacity-70 hover:opacity-100 transition-opacity p-1"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Offline Notification -->
    <Transition name="slide-down">
      <div
        v-if="!isOnline"
        class="fixed top-4 left-4 right-4 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-xl shadow-2xl border border-orange-400"
      >
        <div class="flex items-center">
          <div class="bg-orange-400 rounded-full p-1 mr-3">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p class="font-medium text-sm">🔌 Offline mode</p>
            <p class="text-xs opacity-90">
              Your changes will be saved and will sync with re -connection
            </p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Offline Ready Notification -->
    <Transition name="slide-up">
      <div
        v-if="showOfflineReady"
        class="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-xl shadow-2xl border border-purple-400"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="bg-purple-500 rounded-full p-2 mr-3">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p class="font-bold text-sm">⚡ Ready to work offline!</p>
              <p class="text-xs opacity-90 mt-1">
               You can now design without the Internet
              </p>
            </div>
          </div>
          <button
            @click="showOfflineReady = false"
            class="text-white opacity-70 hover:opacity-100 transition-opacity p-1"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Network Quality Indicator -->
    <div
      v-if="showNetworkIndicator"
      class="fixed top-16 right-4 z-40 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-xs"
    >
      <div class="flex items-center">
        <div
          :class="networkIndicatorClass"
          class="w-2 h-2 rounded-full mr-2"
        ></div>
        {{ networkStatusText }}
      </div>
    </div>

    <!-- Storage Usage Warning -->
    <Transition name="slide-up">
      <div
        v-if="showStorageWarning"
        class="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-xl shadow-2xl border border-yellow-400"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="bg-yellow-400 rounded-full p-2 mr-3">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p class="font-bold text-sm">⚠️Low storage space</p>
              <p class="text-xs opacity-90 mt-1">{{ storageUsageText }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="clearCache"
              class="bg-white text-orange-600 px-3 py-1 rounded-lg font-medium hover:bg-orange-50 transition-all duration-200 text-sm"
            >
Clear cache
            </button>
            <button
              @click="showStorageWarning = false"
              class="text-white opacity-70 hover:opacity-100 transition-opacity p-1"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from "vue";
import { usePWA } from "@/composables/usePWA";

const {
  isUpdateAvailable,
  isInstallable,
  isOnline,
  offlineReady,
  showInstallPrompt,
  updateSW,
  networkInfo,
  getStorageUsage,
  clearAppCache,
} = usePWA();

const updateDismissed = ref(false);
const installDismissed = ref(false);
const showOfflineReady = ref(false);
const isUpdating = ref(false);
const showNetworkIndicator = ref(false);
const showStorageWarning = ref(false);
const storageInfo = ref(null);

// Computed properties
const showInstallBanner = computed(() => {
  return (
    isInstallable.value &&
    !installDismissed.value &&
    localStorage.getItem("pwa-install-dismissed") !== "true"
  );
});

const networkIndicatorClass = computed(() => {
  if (!isOnline.value) return "bg-red-500";

  const effectiveType = networkInfo.value?.effectiveType;
  switch (effectiveType) {
    case "slow-2g":
    case "2g":
      return "bg-red-500";
    case "3g":
      return "bg-yellow-500";
    case "4g":
    default:
      return "bg-green-500";
  }
});

const networkStatusText = computed(() => {
  if (!isOnline.value) return "آفلاین";

  const effectiveType = networkInfo.value?.effectiveType;
  switch (effectiveType) {
    case "slow-2g":
      return "اتصال بسیار کند";
    case "2g":
      return "اتصال کند";
    case "3g":
      return "اتصال متوسط";
    case "4g":
      return "اتصال سریع";
    default:
      return "آنلاین";
  }
});

const storageUsageText = computed(() => {
  if (!storageInfo.value) return "";
  return `${storageInfo.value.percentage}% استفاده شده`;
});

// Methods
const installApp = async () => {
  await showInstallPrompt();
  installDismissed.value = true;
};

const dismissInstall = () => {
  installDismissed.value = true;
  localStorage.setItem("pwa-install-dismissed", "true");
};

const handleUpdate = async () => {
  isUpdating.value = true;
  try {
    await updateSW();
    updateDismissed.value = true;
  } catch (error) {
    console.error("Update failed:", error);
  } finally {
    isUpdating.value = false;
  }
};

const clearCache = async () => {
  try {
    await clearAppCache();
    showStorageWarning.value = false;
    // Show success message
    setTimeout(() => {
      checkStorageUsage();
    }, 1000);
  } catch (error) {
    console.error("Failed to clear cache:", error);
  }
};

const checkStorageUsage = async () => {
  try {
    const usage = await getStorageUsage();
    if (usage) {
      storageInfo.value = usage;
      // Show warning if usage > 80%
      if (usage.percentage > 80) {
        showStorageWarning.value = true;
      }
    }
  } catch (error) {
    console.error("Failed to check storage:", error);
  }
};

// Event listeners
let networkCheckInterval: number;

onMounted(() => {
  installDismissed.value =
    localStorage.getItem("pwa-install-dismissed") === "true";

  // Show offline ready notification for 5 seconds
  if (offlineReady.value) {
    showOfflineReady.value = true;
    setTimeout(() => {
      showOfflineReady.value = false;
    }, 5000);
  }

  // Check storage usage periodically
  checkStorageUsage();
  const storageCheckInterval = setInterval(checkStorageUsage, 60000); // Every minute

  // Show network indicator on slow connections
  networkCheckInterval = setInterval(() => {
    const effectiveType = networkInfo.value?.effectiveType;
    showNetworkIndicator.value =
      effectiveType === "slow-2g" || effectiveType === "2g";
  }, 5000);

  // Handle PWA events
  window.addEventListener("pwa-online-reconnection", () => {
    console.log("Back online - refreshing data");
  });

  window.addEventListener("pwa-offline-mode", () => {
    console.log("Offline mode activated");
  });

  onUnmounted(() => {
    clearInterval(storageCheckInterval);
    clearInterval(networkCheckInterval);
  });
});
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active,
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-up-enter-from {
  transform: translateY(100%) scale(0.95);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%) scale(0.95);
  opacity: 0;
}

.slide-down-enter-from {
  transform: translateY(-100%) scale(0.95);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%) scale(0.95);
  opacity: 0;
}

/* Custom scrollbar for better mobile experience */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
