(() => {
  const WORKSPACE_SELECTORS = [
    "svg.blocklySvg",
    "svg[class*='blocklySvg']",
    ".blocklyWorkspace > svg",
    "svg[role='application']"
  ];

  function isVisible(element) {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" &&
      rect.width > 0 && rect.height > 0;
  }

  function findWorkspace() {
    return WORKSPACE_SELECTORS
      .flatMap((selector) => [...document.querySelectorAll(selector)])
      .find((element) => isVisible(element) &&
        element.querySelector(".blocklyBlockCanvas"));
  }

  function getCanvasBounds(workspace) {
    const layers = [
      workspace.querySelector(".blocklyBlockCanvas")
    ].filter(Boolean);
    const visibleLayers = layers.filter(Boolean);
    if (visibleLayers.length === 0) return null;

    const bounds = visibleLayers.map((layer) => layer.getBBox());
    const left = Math.min(...bounds.map((box) => box.x));
    const top = Math.min(...bounds.map((box) => box.y));
    const right = Math.max(...bounds.map((box) => box.x + box.width));
    const bottom = Math.max(...bounds.map((box) => box.y + box.height));
    if (!Number.isFinite(left) || right <= left || bottom <= top) return null;

    const padding = 96;
    return {
      x: left - padding,
      y: top - padding,
      width: right - left + padding * 2,
      height: bottom - top + padding * 2
    };
  }

  function copyComputedStyles(source, target) {
    const sourceElements = [source, ...source.querySelectorAll("*")];
    const targetElements = [target, ...target.querySelectorAll("*")];
    const properties = [
      "font-family",
      "font-size",
      "font-weight",
      "font-style",
      "font-variant",
      "letter-spacing",
      "text-anchor",
      "fill",
      "fill-opacity",
      "stroke",
      "stroke-width",
      "stroke-opacity",
      "paint-order"
    ];

    sourceElements.forEach((sourceElement, index) => {
      const targetElement = targetElements[index];
      if (!targetElement || !(sourceElement instanceof SVGElement)) return;
      const computed = getComputedStyle(sourceElement);
      properties.forEach((property) => {
        let value = computed.getPropertyValue(property);
        if (property === "fill" || property === "stroke") {
          if (!value || value === "currentColor" || value.startsWith("url(")) {
            value = computed.color || "#000";
          }
          if (value === "none") value = "none";
        }
        if (value && value !== "normal") targetElement.setAttribute(property, value);
      });
      targetElement.removeAttribute("style");
      targetElement.removeAttribute("class");
      targetElement.removeAttribute("clip-path");
      targetElement.removeAttribute("mask");
      targetElement.removeAttribute("filter");
    });
  }

  function removeWordUnsupportedFeatures(svg) {
    svg.querySelectorAll("defs, use, symbol, marker, pattern, linearGradient, radialGradient")
      .forEach((element) => element.remove());
    svg.querySelectorAll("image").forEach((element) => element.remove());
    [...svg.querySelectorAll("rect")]
      .filter((element) => element.localName === "rect" &&
        element.getAttribute("width") === "100%" &&
        element.getAttribute("height") === "100%")
      .forEach((element) => element.remove());
    svg.removeAttribute("role");
    svg.removeAttribute("xmlns:html");
    svg.removeAttribute("data-cached-width");
    svg.removeAttribute("data-cached-height");
    svg.removeAttribute("overflow");
    svg.removeAttribute("font-family");
    svg.removeAttribute("font-size");
    svg.removeAttribute("font-weight");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "none");
    svg.querySelectorAll("*").forEach((element) => {
      for (const attribute of [...element.attributes]) {
        if (attribute.name.startsWith("data-") ||
            attribute.name === "id" ||
            attribute.name === "aria-label" ||
            attribute.name.startsWith("aria-") ||
            attribute.name === "role" ||
            attribute.name === "tabindex" ||
            attribute.name === "aria-roledescription") {
          element.removeAttribute(attribute.name);
        }
      }
      element.removeAttribute("style");
    });
  }

  function normalizeColors(svg) {
    svg.querySelectorAll("*").forEach((element) => {
      ["fill", "stroke"].forEach((attributeName) => {
        const value = element.getAttribute(attributeName);
        const match = value?.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/);
        if (!match) return;
        const alpha = match[4] === undefined ? 1 : Number(match[4]);
        if (alpha === 0) {
          element.setAttribute(attributeName, "none");
          return;
        }
        element.setAttribute(attributeName, `rgb(${match[1]}, ${match[2]}, ${match[3]})`);
        if (alpha < 1) {
          const opacityName = `${attributeName}-opacity`;
          element.setAttribute(opacityName, `${alpha}`);
        }
      });
    });
    svg.querySelectorAll("text, tspan").forEach((element) => {
      element.removeAttribute("dominant-baseline");
    });
  }

  function createSvg(workspace) {
    const bounds = getCanvasBounds(workspace);
    if (!bounds) return null;

    const clone = workspace.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    clone.setAttribute("version", "1.1");
    clone.setAttribute("viewBox", `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);
    clone.setAttribute("width", `${Math.max(1, Math.ceil(bounds.width))}`);
    clone.setAttribute("height", `${Math.max(1, Math.ceil(bounds.height))}`);
    clone.setAttribute("preserveAspectRatio", "xMinYMin meet");
    clone.setAttribute("overflow", "visible");
    clone.removeAttribute("style");
    clone.removeAttribute("class");
    clone.removeAttribute("clip-path");
    clone.removeAttribute("mask");
    clone.removeAttribute("filter");

    copyComputedStyles(workspace, clone);
    clone.querySelectorAll(
      ".blocklyBubbleCanvas, .blocklyBubble, .blocklyComment, " +
      "[class*='blocklyBubble'], [class*='blocklyComment'], foreignObject"
    ).forEach((element) => element.remove());
    clone.querySelectorAll("textarea, input, [contenteditable='true']")
      .forEach((element) => element.remove());
    clone.querySelectorAll(".blocklyMainBackground, .blocklyScrollbarBackground")
      .forEach((background) => background.remove());
    removeWordUnsupportedFeatures(clone);
    normalizeColors(clone);

    return new XMLSerializer().serializeToString(clone);
  }

  function downloadSvg() {
    const workspace = findWorkspace();
    if (!workspace) {
      return { ok: false, error: chrome.i18n.getMessage("initialStatus") };
    }
    const svg = createSvg(workspace);
    if (!svg) {
      return { ok: false, error: chrome.i18n.getMessage("blocksNotFound") };
    }

    const blob = new Blob(
      [`<?xml version="1.0" encoding="UTF-8"?>\n${svg}`],
      { type: "image/svg+xml;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `makecode-program-${new Date().toISOString().slice(0, 10)}.svg`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { ok: true };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "export-svg") {
      downloadSvg().then(sendResponse).catch((error) => {
        sendResponse({ ok: false, error: error.message });
      });
      return true;
    }
    return true;
  });

})();
