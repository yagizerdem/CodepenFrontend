function flash() {
  const el = document.querySelector<HTMLDivElement>(".flash");

  if (!el) return;

  // Reset state
  el.style.display = "block";
  el.style.opacity = "1";
  el.style.transition = "none";

  // Force reflow to apply the reset styles immediately
  void el.offsetWidth;

  // Animate opacity to 0.5
  el.style.transition = "opacity 300ms";
  el.style.opacity = "0.5";

  // After 300ms, fade out
  setTimeout(() => {
    el.style.transition = "opacity 300ms";
    el.style.opacity = "0";
  }, 300);

  // After fade out finishes, hide completely & reset opacity
  setTimeout(() => {
    el.style.display = "none";
    el.style.opacity = "1";
    el.style.transition = "none";
  }, 600);
}

export { flash };
