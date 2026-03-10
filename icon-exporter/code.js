figma.showUI(__html__, { width: 400, height: 320 });

figma.ui.onmessage = async function (msg) {
  if (msg.type === "export") {
    var template = msg.template || "{Name}-{Size}";
    var format = msg.format || "SVG";
    var selection = figma.currentPage.selection;

    if (selection.length === 0) {
      figma.ui.postMessage({
        type: "error",
        message: "Select a group or frame first.",
      });
      return;
    }

    // Collect direct children of each selected group/frame.
    // If a non-container node is selected directly, include it as-is.
    var nodes = [];
    for (var s = 0; s < selection.length; s++) {
      var sel = selection[s];
      if ("children" in sel && sel.children.length > 0) {
        for (var c = 0; c < sel.children.length; c++) {
          nodes.push(sel.children[c]);
        }
      } else {
        nodes.push(sel);
      }
    }

    if (nodes.length === 0) {
      figma.ui.postMessage({
        type: "error",
        message: "No exportable layers found in selection.",
      });
      return;
    }

    var files = [];

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];

      var filename = buildFilename(node) || sanitize(node.name);

      var ext = format.toLowerCase();
      var settings = {
        format: format,
        constraint: { type: "SCALE", value: 1 },
      };

      try {
        var bytes = await node.exportAsync(settings);
        files.push({ name: filename + "." + ext, bytes: Array.from(bytes) });
      } catch (e) {
        figma.ui.postMessage({
          type: "error",
          message: "Failed to export " + node.name + ": " + e.message,
        });
        return;
      }
    }

    var zipName =
      selection.length === 1 ? sanitize(selection[0].name) : "icons";
    figma.ui.postMessage({ type: "download", files: files, zipName: zipName });
  }

  if (msg.type === "cancel") {
    figma.closePlugin();
  }

  if (msg.type === "done") {
    figma.closePlugin();
  }
};

function buildFilename(node) {
  var name = node.name;

  // If it looks like a variant name ("Name=Arrow, Size=16"), extract just the values
  if (name.indexOf("=") !== -1) {
    var parts = name.split(",");
    var values = [];
    for (var i = 0; i < parts.length; i++) {
      var pair = parts[i].trim().split("=");
      if (pair.length === 2) values.push(pair[1].trim());
    }
    if (values.length) return sanitize(values.join("-"));
  }

  // Plain name — strip leading path segments
  return sanitize(name.split("/").pop().trim());
}

function parseVariantName(name) {
  // Parses "Name=Arrow, Size=16" → { Name: "Arrow", Size: "16" }
  var props = {};
  var parts = name.split(",");
  for (var i = 0; i < parts.length; i++) {
    var pair = parts[i].trim().split("=");
    if (pair.length === 2) {
      props[pair[0].trim()] = pair[1].trim();
    }
  }
  return props;
}

function sanitize(str) {
  return str.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}
