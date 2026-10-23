# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## font -style questions

Based on the design documentation provided, there are 3 distinct font families used across ThriftHub and SCREEN_5:

1. Playfair Display (Serif / Display)

Weights: 600 (SemiBold), 700 (Bold), and Italic

Role: Brand logo, hero headlines, section titles, editorial accents, and large numerical metrics

2. Plus Jakarta Sans / Inter (Sans-Serif / Interface)

Weights: 400 (Regular), 500 (Medium), 600 (SemiBold), and 700 (Bold)

Role: UI navigation, body paragraphs, product titles, filter badges, buttons, form inputs, and footer links

3. JetBrains Mono / Space Mono (Monospace / Technical)

Weights: 500 (Medium) and 600 (SemiBold)

Role: SKU/Serial codes, batch provenance tags, AI fit match metrics, dimensions, and system telemetry readouts

/_ Add this to your main CSS stylesheet _/
:root {
--font-serif: 'Playfair Display', Georgia, serif;
--font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
}

/_ Base interface font applied to the site _/
body {
font-family: var(--font-sans);
}

/_ Font utility classes _/
.font-serif {
font-family: var(--font-serif);
}

.font-sans {
font-family: var(--font-sans);
}

.font-mono {
font-family: var(--font-mono);
}
