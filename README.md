<div align="center">

# ⚡ Aera

**A desktop application built with Electron, Vite, Lit, and C++ (Node-API)**

[![Electron](https://img.shields.io/badge/Electron-2B2E3A?style=for-the-badge&logo=electron&logoColor=9FEAF9)](https://www.electronjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Lit](https://img.shields.io/badge/Lit-324FFF?style=for-the-badge&logo=lit&logoColor=white)](https://lit.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![C++](https://img.shields.io/badge/C++-00599C?style=for-the-badge&logo=cplusplus&logoColor=white)](https://isocpp.org/)

<p>A performant desktop architecture combining a reactive Lit Web Component frontend, Electron IPC bridge, and an ABI-stable native C++ backend.</p>

</div>

---

## 🚀 Features

- **Fast Bundling:** Powered by `electron-vite` for process bundling.
- **Lightweight UI:** Web Components built with **Lit** for high-performance rendering.
- **Native C++ Core:** High-performance native operations using `node-addon-api` (Node-API).
- **Secure IPC:** Strictly typed, context-isolated bridge between renderer and main processes.

---

## 🛠 Prerequisites & Tools

### Recommended IDE Setup
- [VS Code](https://code.visualstudio.com/)
- [C/C++ Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### Native Build Requirements
Compiling the C++ backend requires native C/C++ compilation tools installed on your host OS:
- **macOS:** Xcode Command Line Tools (`xcode-select --install`)
- **Windows:** [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (C++ workload)
- **Linux:** `build-essential` package (`sudo apt install build-essential`)

---

## 📦 Project Setup

### 1. Install Dependencies
```bash
npm install

```

### 2. Build the C++ Native Module

Before running the application for the first time, you must compile the native C++ source files (`binding.gyp`):

```bash
npm run build:native

```

> **Note:** Run `npm run build:native` whenever you modify C++ source files in `src/native/`.

---

## 💻 Development

Start the Vite development server and Electron simultaneously:

```bash
npm run dev

```

---

## 🏗️ Building & Packaging

Compile both the frontend assets and the native binaries for distribution:

```bash
# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux

```

---

## 📁 Project Structure

```text
├── src/
│   ├── main/          # Electron Main process entry points
│   ├── preload/       # Secure IPC contextBridge exposed to Renderer
│   ├── native/        # Native C++ source code (node-addon-api)
│   └── renderer/      # Lit Web Components frontend
│       ├── src/       # TS/Lit component files
│       └── index.html # Renderer entry point
├── binding.gyp        # node-gyp native build configuration
└── package.json

```

```