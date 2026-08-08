/* Compasso · Composição determinística do documento da aplicação */
(function (root, factory) {
  const api = factory();
  root.CompassoAppComposition = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof self !== "undefined" ? self : globalThis, function () {
  const BLOCK_START = "/* COMPASSO:MODULES:START */";
  const BLOCK_END = "/* COMPASSO:MODULES:END */";
  const SENTINEL_PREFIX = "/* COMPASSO:MODULE:";

  function count(text, token) {
    if (!token) return 0;
    let result = 0;
    let index = 0;
    while ((index = text.indexOf(token, index)) !== -1) {
      result += 1;
      index += token.length;
    }
    return result;
  }

  function identity(file) {
    return encodeURIComponent(String(file));
  }

  function startSentinel(file) {
    return `${SENTINEL_PREFIX}${identity(file)}:START */`;
  }

  function endSentinel(file) {
    return `${SENTINEL_PREFIX}${identity(file)}:END */`;
  }

  function generationMarker(generation) {
    return `<meta name="compasso-application-generation" content="${generation}" data-composition="complete">`;
  }

  function failure(html, code, details = {}) {
    return Object.freeze({ ok: false, html, code, details: Object.freeze({ ...details }) });
  }

  function prerequisites(manifest) {
    return Array.isArray(manifest?.composition?.supportPrerequisites)
      ? manifest.composition.supportPrerequisites
      : [];
  }

  function moduleFiles(manifest) {
    return Array.isArray(manifest?.modules)
      ? manifest.modules.map((module) => String(module.file || ""))
      : [];
  }

  function validateSupport(html, manifest) {
    for (const prerequisite of prerequisites(manifest)) {
      const matches = count(html, prerequisite.token);
      if (matches !== 1) {
        return failure(html, matches ? "ambiguous-support" : "missing-support", {
          support: prerequisite.id,
          matches,
        });
      }
    }
    return null;
  }

  function validateModules(html, manifest) {
    const files = moduleFiles(manifest);
    if (!files.length || new Set(files).size !== files.length || files.some((file) => !file)) {
      return failure(html, "invalid-manifest-modules");
    }
    if (count(html, BLOCK_START) !== 1 || count(html, BLOCK_END) !== 1) {
      return failure(html, "malformed-composition-block");
    }
    const startIndex = html.indexOf(BLOCK_START);
    const endIndex = html.indexOf(BLOCK_END);
    if (endIndex <= startIndex) return failure(html, "malformed-composition-block");

    let cursor = startIndex + BLOCK_START.length;
    const expectedTokens = [];
    for (const file of files) {
      const start = startSentinel(file);
      const end = endSentinel(file);
      if (count(html, start) !== 1 || count(html, end) !== 1) {
        return failure(html, "module-identity", { file });
      }
      const moduleStart = html.indexOf(start, cursor);
      const moduleEnd = html.indexOf(end, moduleStart + start.length);
      if (moduleStart < cursor || moduleEnd < moduleStart || moduleEnd > endIndex) {
        return failure(html, "module-order", { file });
      }
      cursor = moduleEnd + end.length;
      expectedTokens.push(start, end);
    }

    const observedTokens = html
      .slice(startIndex, endIndex + BLOCK_END.length)
      .match(/\/\* COMPASSO:MODULE:[^:*]+:(?:START|END) \*\//g) || [];
    if (
      observedTokens.length !== expectedTokens.length ||
      observedTokens.some((token, index) => token !== expectedTokens[index])
    ) {
      return failure(html, "unknown-or-duplicate-module");
    }
    return null;
  }

  function validateDocument(html, manifest, options = {}) {
    const generation = String(manifest?.cacheName || "");
    if (!generation) return failure(html, "missing-generation");
    const supportFailure = validateSupport(html, manifest);
    if (supportFailure) return supportFailure;
    const moduleFailure = validateModules(html, manifest);
    if (moduleFailure) return moduleFailure;
    const slot = String(manifest?.composition?.moduleSlot || "");
    const generationSlot = String(manifest?.composition?.generationSlot || "");
    if (slot && count(html, slot)) return failure(html, "unresolved-module-slot");
    if (generationSlot && count(html, generationSlot)) return failure(html, "unresolved-generation-slot");
    if (options.requireGeneration !== false) {
      const marker = generationMarker(generation);
      if (count(html, marker) !== 1 || count(html, 'name="compasso-application-generation"') !== 1) {
        return failure(html, "generation-identity");
      }
    }
    return Object.freeze({ ok: true, html, generation, files: Object.freeze(moduleFiles(manifest)) });
  }

  function composeDocument({ html, manifest, modules }) {
    const original = String(html || "");
    const generation = String(manifest?.cacheName || "");
    const slot = String(manifest?.composition?.moduleSlot || "");
    const generationSlot = String(manifest?.composition?.generationSlot || "");
    if (!original || !generation || !slot || !generationSlot) {
      return failure(original, "invalid-composition-input");
    }

    const alreadyComposed = count(original, BLOCK_START) || count(original, BLOCK_END) || count(original, 'name="compasso-application-generation"');
    if (alreadyComposed) {
      if (count(original, slot) || count(original, generationSlot)) {
        return failure(original, "mixed-composition-state");
      }
      return validateDocument(original, manifest);
    }

    const moduleSlotCount = count(original, slot);
    if (moduleSlotCount !== 1) {
      return failure(original, moduleSlotCount ? "ambiguous-module-slot" : "missing-module-slot", { matches: moduleSlotCount });
    }
    const generationSlotCount = count(original, generationSlot);
    if (generationSlotCount !== 1) {
      return failure(original, generationSlotCount ? "ambiguous-generation-slot" : "missing-generation-slot", { matches: generationSlotCount });
    }
    const supportFailure = validateSupport(original, manifest);
    if (supportFailure) return supportFailure;

    const expectedFiles = moduleFiles(manifest);
    const sources = Array.isArray(modules) ? modules : [];
    if (sources.length !== expectedFiles.length) {
      return failure(original, "module-count", { expected: expectedFiles.length, actual: sources.length });
    }

    const blocks = [];
    for (let index = 0; index < expectedFiles.length; index += 1) {
      const file = expectedFiles[index];
      const module = sources[index] || {};
      const source = String(module.source || "");
      if (String(module.file || "") !== file) return failure(original, "module-order", { file });
      if (!source.trim()) return failure(original, "missing-module", { file });
      if (source.includes(SENTINEL_PREFIX)) return failure(original, "reserved-module-sentinel", { file });
      blocks.push(
        startSentinel(file),
        `globalThis.CompassoBootstrapDiagnostic?.start(${JSON.stringify(file)});`,
        source,
        `globalThis.CompassoBootstrapDiagnostic?.done(${JSON.stringify(file)});`,
        endSentinel(file),
      );
    }

    const moduleBlock = [BLOCK_START, ...blocks, BLOCK_END].join("\n");
    let candidate = original.replace(slot, () => moduleBlock);
    const structural = validateDocument(candidate.replace(generationSlot, ""), manifest, { requireGeneration: false });
    if (!structural.ok) return failure(original, structural.code, structural.details);
    candidate = candidate.replace(generationSlot, () => generationMarker(generation));
    const complete = validateDocument(candidate, manifest);
    return complete.ok ? complete : failure(original, complete.code, complete.details);
  }

  return Object.freeze({
    BLOCK_START,
    BLOCK_END,
    SENTINEL_PREFIX,
    count,
    identity,
    startSentinel,
    endSentinel,
    generationMarker,
    validateDocument,
    composeDocument,
  });
});
