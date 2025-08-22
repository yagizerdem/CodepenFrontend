/**
 * @fileoverview Utility functions for showing toast notifications throughout the application
 * using Toastify.js. Provides success, error, and info variations with consistent styling.
 */

import Toastify from "toastify-js";

/**
 * Displays a success toast notification with a green gradient background.
 *
 * @param {string} message - The message to display in the toast.
 */
export function showSuccessToast(message: string) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    close: true,
    stopOnFocus: true,
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
  }).showToast();
}

/**
 * Displays an error toast notification with a red gradient background.
 *
 * @param {string} message - The message to display in the toast.
 */
export function showErrorToast(message: string) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    close: true,
    stopOnFocus: true,
    style: {
      background: "linear-gradient(to right, #e53935, #e35d5b)",
    },
  }).showToast();
}

/**
 * Displays an informational toast notification with a blue gradient background.
 *
 * @param {string} message - The message to display in the toast.
 */
export function showInfoToast(message: string) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    close: true,
    stopOnFocus: true,
    style: {
      background: "linear-gradient(to right, #2196f3, #6ec6ff)",
    },
  }).showToast();
}
