# Sistema de Onboarding con Autenticación

## Descripción

Este módulo implementa un flujo de bienvenida (onboarding) con 5 pantallas deslizables que presenta las funcionalidades principales de Fleak antes de solicitar al usuario que inicie sesión.

## Componentes

### 1. `OnboardingFlow`
Componente de diálogo fullscreen que maneja el flujo de bienvenida de 5 pasos:

1. **Bienvenida**: Introducción a Fleak
2. **Conecta con Amigos**: Funcionalidad social
3. **Rastrea tus Finanzas**: Gestión financiera
4. **Testimonios Verificados**: Sistema de reseñas
5. **Autenticación**: Pantalla de inicio de sesión

#### Props
- `open: boolean` - Controla la visibilidad del diálogo
- `onComplete: () => void` - Callback ejecutado al completar el onboarding

#### Características
- Transiciones suaves con `Fade` entre pantallas
- Integración con `useAuthenticate` de OnchainKit/MiniKit
- Manejo de estados de autenticación (loading, error, success)
- Opción de "Continuar sin iniciar sesión" para modo guest
- Persistencia de estado en `localStorage`
- Diseño responsive con Material-UI

### 2. `OnboardingGate`
Componente wrapper que controla cuándo mostrar el onboarding.

#### Props
- `children: ReactNode` - Contenido de la aplicación a mostrar después del onboarding

#### Lógica
1. Verifica si el usuario tiene contexto de MiniKit
2. Si está autenticado: verifica `localStorage` con clave `onboarding:{fid}`
3. Si no está autenticado: verifica si se saltó con `onboarding:guest`
4. Muestra el onboarding solo si no se ha completado previamente

## Uso

```tsx
import { OnboardingGate } from "@/app/components/onboarding";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RootProvider>
      <OnboardingGate>
        {children}
      </OnboardingGate>
    </RootProvider>
  );
}
```

## Flujo de Autenticación

El componente sigue las mejores prácticas de Base/MiniKit:

1. **Defer authentication**: El usuario explora primero (4 pantallas) antes de ver la autenticación
2. **Progressive disclosure**: Solo se pide auth cuando se muestra valor
3. **Client context**: Usa `useMiniKit()` para obtener `displayName` y personalizar la UI
4. **Verified user**: Usa `useAuthenticate()` para obtener identidad criptográficamente verificada
5. **Guest mode**: Permite continuar sin autenticación si el usuario lo prefiere

## Persistencia

### Usuario Autenticado
```typescript
localStorage.setItem(`onboarding:${user.fid}`, "completed");
```

### Usuario Guest
```typescript
localStorage.setItem("onboarding:guest", "skipped");
```

## Personalización

### Agregar/Modificar Pasos
Edita el array `onboardingSteps` en `OnboardingFlow.tsx`:

```typescript
const onboardingSteps = [
  {
    icon: "material_icon_name", // Material Symbols icon
    title: "Título del Paso",
    description: "Descripción detallada del paso",
  },
  // ... más pasos
];
```

### Estilos
Los componentes usan el tema de Material-UI definido en `rootProvider.tsx`:
- Colores: negro (#111111) y blanco
- Border radius: 24px
- Transiciones: 600ms

## Consideraciones de Seguridad

- ✅ Usa `useAuthenticate()` para operaciones seguras (no solo contexto)
- ✅ Verifica `signIn()` result antes de considerar autenticación exitosa
- ✅ Maneja errores de autenticación con feedback claro
- ✅ Permite modo guest como fallback

## Testing

Para probar el onboarding en desarrollo:

1. Limpia `localStorage`: 
   ```javascript
   localStorage.clear()
   ```

2. Recarga la aplicación

3. El onboarding debe aparecer automáticamente

## Dependencias

- `@coinbase/onchainkit/minikit` - Hooks de autenticación y contexto
- `@mui/material` - Componentes UI
- `material-symbols` - Iconos
