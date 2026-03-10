function rgbaToHex(color) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a;

  const hex =
    "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");

  if (a === 1) return hex;

  const alpha = Math.round(a * 255)
    .toString(16)
    .padStart(2, "0");

  return hex + alpha;
}

function resolveAlias(value) {
  if (value.type === "VARIABLE_ALIAS") {
    const variable = figma.variables.getVariableById(value.id);
    if (!variable) return null;

    const firstMode = Object.values(variable.valuesByMode)[0];
    return resolveAlias(firstMode);
  }

  if (value.r !== undefined) {
    return rgbaToHex(value);
  }

  return value;
}

function setDeep(obj, path, value) {
  let current = obj;

  for (let i = 0; i < path.length - 1; i++) {
    if (!current[path[i]]) current[path[i]] = {};
    current = current[path[i]];
  }

  current[path[path.length - 1]] = value;
}

function exportTokens() {
  const collections = figma.variables.getLocalVariableCollections();
  const output = {};

  for (const collection of collections) {
    const tokens = {};

    const variables = collection.variableIds
      .map((id) => figma.variables.getVariableById(id))
      .filter(Boolean);

    for (const variable of variables) {
      const namePath = variable.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .split("/");

      const token = {
        value: {},
      };

      for (const modeId in variable.valuesByMode) {
        const raw = variable.valuesByMode[modeId];
        const resolved = resolveAlias(raw);

        const mode =
          collection.modes.find((m) => m.modeId === modeId).name || "default";

        token.value[mode] = resolved;
      }

      token.type = variable.resolvedType;

      setDeep(tokens, namePath, token);
    }

    const collectionName = collection.name.toLowerCase().replace(/\s+/g, "-");

    output[collectionName] = tokens;
  }

  return output;
}

function download(data) {
  const json = JSON.stringify(data, null, 2);

  figma.showUI(
    `<script>
      const json = ${JSON.stringify(json)};
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tokens.json';
      a.click();
      parent.postMessage({ pluginMessage: 'done' }, '*');
    </script>`,
    { visible: false },
  );
}

const tokens = exportTokens();
download(tokens);

figma.ui.onmessage = () => figma.closePlugin();
