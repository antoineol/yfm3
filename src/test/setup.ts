if (typeof window !== "undefined" && window.confirm === undefined) {
  window.confirm = () => true;
}

if (typeof Element !== "undefined" && Element.prototype.animate === undefined) {
  Element.prototype.animate = () =>
    ({
      cancel: () => undefined,
      finish: () => undefined,
      play: () => undefined,
      pause: () => undefined,
      reverse: () => undefined,
      updatePlaybackRate: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => true,
      onfinish: null,
    }) as unknown as Animation;
}
