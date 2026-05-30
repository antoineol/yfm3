if (typeof window !== "undefined" && window.confirm === undefined) {
  window.confirm = () => true;
}
