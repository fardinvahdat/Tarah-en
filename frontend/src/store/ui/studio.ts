import { defineStore } from "pinia";

export const useStudioStore = defineStore("Studio", () => {
  const isEditTextDialogVisible = ref(false);
  const stagedTextValue = ref("");
  const isExportDialogVisible = ref(false);
  const isHistoryVisible = ref(false);

  // Track whether the current state should be saved in history
  const skipNextHistoryEntry = ref(false);

  function showEditTextDialog(initialText = "") {
    stagedTextValue.value = initialText;
    isEditTextDialogVisible.value = true;
  }

  function hideEditTextDialog() {
    isEditTextDialogVisible.value = false;
  }

  function showExportDialog() {
    isExportDialogVisible.value = true;
  }

  function hideExportDialog() {
    isExportDialogVisible.value = false;
  }

  function toggleHistoryPanel() {
    isHistoryVisible.value = !isHistoryVisible.value;
  }

  function setSkipNextHistoryEntry(skip: any) {
    skipNextHistoryEntry.value = skip;
  }

  return {
    isEditTextDialogVisible,
    stagedTextValue,
    isExportDialogVisible,
    isHistoryVisible,
    skipNextHistoryEntry,
    showEditTextDialog,
    hideEditTextDialog,
    showExportDialog,
    hideExportDialog,
    toggleHistoryPanel,
    setSkipNextHistoryEntry,
  };
});
