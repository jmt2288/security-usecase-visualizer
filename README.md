# Use Case Visualizer

Visualizador interactivo de casos de uso de ciberseguridad basado en el framework MITRE ATT&CK. Permite visualizar, gestionar y exportar casos de uso con una interfaz con una red de nodos interactiva que permite entender las relaciones entre cada caso de uso.

## Características

- 📊 Visualización de nodos interactivos
- 📥 Importar casos de uso en JSON
- 💾 Almacenamiento local automático
- 🔍 Panel de detalles con información completa

<img width="1901" height="950" alt="image" src="https://github.com/user-attachments/assets/f10fc6bf-6dbb-496b-8a3d-4dbd43900f6e" />

## Requisitos

- Node.js (v18 o superior)
- npm

## Instalación y Ejecución

1. **Instalación del código:**
   ```bash
   git clone https://github.com/jmt2288/security-usecase-visualizer.git
   cd security-usecase-visualizer
   ```

2. **Dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar:**
   ```bash
   npm run dev
   ```
   La aplicación se abrirá en `http://localhost:3000`


## Estructura del Proyecto

```
src/
├── components/          # Componentes React
├── App.tsx             # Componente principal
├── constants.ts        # Datos iniciales
├── types.ts            # Tipos TypeScript
└── index.tsx           # Entrada de la aplicación
```


*Los casos de uso cargados se almacenan automáticamente en el localStorage del navegador. Los datos persisten entre sesiones.*
