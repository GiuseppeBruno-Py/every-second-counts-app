const test = require("node:test");
const assert = require("node:assert/strict");
const designSystem = require("../design-system-model.js");

test("breakpoints cobrem os três contratos responsivos", () => {
  assert.deepEqual(designSystem.breakpoints, {
    mobile: 360,
    tablet: 768,
    desktop: 1280,
  });
});

test("catálogo declara componentes e papéis do SCRUM-14", () => {
  assert.deepEqual(designSystem.components, [
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
  assert.deepEqual(designSystem.roles, [
    "primary",
    "secondary",
    "neutral",
    "destructive",
    "link",
  ]);
});

test("papéis desconhecidos são seguros e ações destrutivas têm precedência", () => {
  assert.equal(designSystem.role("unknown"), "neutral");
  assert.equal(designSystem.component("unknown"), null);
  assert.equal(
    designSystem.inferButton({ className: "primary delete-action" }),
    "destructive",
  );
  assert.equal(
    designSystem.inferButton({ className: "ux-execute" }),
    "primary",
  );
  assert.equal(
    designSystem.inferButton({ className: "quiet-btn" }),
    "secondary",
  );
});
