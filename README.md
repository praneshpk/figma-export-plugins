# Figma Token Exporter

A custom Figma plugin for exporting design tokens.

## Setup

### 1. Install Figma Desktop

The plugin API is only available in the Figma desktop app. Download it from [figma.com/downloads](https://www.figma.com/downloads/).

### 2. Clone this repo

```bash
git clone <repo-url>
cd <repo-name>
```

### 3. Load the plugin in Figma

1. Open Figma Desktop and navigate to any project
2. Right-click anywhere on the canvas
3. Go to **Plugins → Development → Import plugin from manifest...**
4. Browse to this repo and select the `manifest.json` file

The plugin will now appear under **Plugins → Development** in any project.

## Usage

1. Open a Figma file that contains variables
2. Right-click → **Plugins → Development → Export Tokens (Style Dictionary)**
3. The plugin will run and automatically download a `tokens.json` file

The exported file contains all local variable collections, with values keyed by mode (e.g. `Desktop`, `Mobile`, `Light`, `Dark`).
