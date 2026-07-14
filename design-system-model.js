/* Compasso · Contrato declarativo do design system */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CompassoDesignSystemModel = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const breakpoints = Object.freeze({
    mobile: 360,
    tablet: 768,
    desktop: 1280,
  });
  const roles = Object.freeze([
    "primary",
    "secondary",
    "neutral",
    "destructive",
    "link",
  ]);
  const components = Object.freeze([
    "button",
    "icon-button",
    "card",
    "empty-state",
    "field",
    "select",
    "tabs",
    "dialog",
    "drawer",
    "menu",
    "badge",
    "toast",
    "skeleton",
  ]);
  const tokens = Object.freeze({
    color: Object.freeze([
      "canvas",
      "surface",
      "surface-raised",
      "text",
      "text-muted",
      "border",
      "focus",
      "accent",
      "success",
      "warning",
      "danger",
    ]),
    space: Object.freeze(["1", "2", "3", "4", "5", "6", "8", "10"]),
    type: Object.freeze(["caption", "body", "label", "title", "display"]),
    radius: Object.freeze(["sm", "md", "lg", "xl", "pill"]),
  });
  function role(value) {
    return roles.includes(value) ? value : "neutral";
  }
  function component(value) {
    return components.includes(value) ? value : null;
  }
  function inferButton({ className = "", dataset = {} } = {}) {
    const names = String(className).split(/\s+/);
    if (
      names.some((name) => /danger|delete|destructive/.test(name)) ||
      dataset.delete !== undefined
    )
      return "destructive";
    if (names.some((name) => /primary|execute|complete/.test(name)))
      return "primary";
    if (names.some((name) => /secondary|quiet/.test(name))) return "secondary";
    if (names.some((name) => /link/.test(name))) return "link";
    return "neutral";
  }
  return Object.freeze({
    breakpoints,
    roles,
    components,
    tokens,
    role,
    component,
    inferButton,
  });
});
