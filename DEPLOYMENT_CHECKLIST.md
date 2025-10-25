# 📋 Checklist de Deployment - Fleak

Este documento contiene **todas las tareas pendientes** para poder deployar tanto el backend de Next.js como los contratos inteligentes de Fleak.

---

## 🏗️ **PARTE 1: Smart Contracts (Foundry)**

### 1.1 Configuración del Proyecto de Contratos

- [ ] **Navegar al repositorio de contratos**
  ```bash
  cd /home/saul/Documentos/proyectos/batches/fleak-contracts
  ```

- [ ] **Verificar que Foundry está instalado**
  ```bash
  forge --version
  # Si no está instalado: curl -L https://foundry.paradigm.xyz | bash && foundryup
  ```

- [ ] **Instalar dependencias**
  ```bash
  forge install
  ```

- [ ] **Compilar contratos**
  ```bash
  forge build
  ```

### 1.2 Testing de Contratos

- [ ] **Ejecutar tests unitarios**
  ```bash
  forge test
  ```

- [ ] **Ejecutar tests con coverage**
  ```bash
  forge coverage
  ```

- [ ] **Verificar que todos los tests pasan al 100%**

- [ ] **Revisar casos edge:**
  - [ ] Double resolution (intentar resolver un flake 2 veces)
  - [ ] Refund claim doble (mismo participante intenta reclamar 2 veces)
  - [ ] Stake en flake con estado incorrecto
  - [ ] Oracle address incorrecto intenta resolver
  - [ ] FeeBps mayor a MAX_FEE_BPS (1000)

### 1.3 Configurar Variables de Deployment

- [ ] **Crear archivo `.env` en el directorio de contratos**
  ```bash
  cp .env.example .env  # Si existe
  ```

- [ ] **Configurar variables necesarias:**
  ```env
  # Private key de la wallet deployer (con fondos para gas)
  DEPLOYER_PRIVATE_KEY=0x...

  # Private key de la wallet Oracle
  ORACLE_ADDRESS=0x...

  # RPC URL para Base Sepolia
  BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

  # (Opcional) RPC URL para Base Mainnet
  BASE_MAINNET_RPC_URL=https://mainnet.base.org

  # Etherscan API Key para verificación
  BASESCAN_API_KEY=...
  ```

- [ ] **Fondear wallet deployer:**
  - [ ] Obtener ETH de testnet en https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
  - [ ] Verificar balance: `cast balance <DEPLOYER_ADDRESS> --rpc-url $BASE_SEPOLIA_RPC_URL`

- [ ] **Fondear wallet Oracle:**
  - [ ] Oracle necesita ETH para ejecutar `resolveFlake` y `openRefunds`
  - [ ] Recomendado: ~0.5 ETH en testnet, cantidad mayor en mainnet

### 1.4 Deployment a Base Sepolia (Testnet)

- [ ] **Crear script de deployment**
  - Ubicación: `script/DeployFleakEscrow.s.sol`
  - Debe deployar `FleakEscrow` con `ORACLE_ADDRESS` como parámetro del constructor

- [ ] **Ejecutar deployment**
  ```bash
  forge script script/DeployFleakEscrow.s.sol:DeployFleakEscrow \
    --rpc-url $BASE_SEPOLIA_RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY \
    --broadcast \
    --verify
  ```

- [ ] **Guardar dirección del contrato deployado**
  - Ejemplo: `FleakEscrow deployed at: 0x1234...`
  - Esta dirección se usará en el backend

- [ ] **Verificar contrato en BaseScan**
  ```bash
  forge verify-contract <CONTRACT_ADDRESS> \
    src/FleakEscrow.sol:FleakEscrow \
    --chain-id 84532 \
    --etherscan-api-key $BASESCAN_API_KEY \
    --constructor-args $(cast abi-encode "constructor(address)" $ORACLE_ADDRESS)
  ```

- [ ] **Verificar estado inicial del contrato:**
  ```bash
  cast call <CONTRACT_ADDRESS> "oracle()(address)" --rpc-url $BASE_SEPOLIA_RPC_URL
  # Debe retornar la dirección del Oracle
  ```

### 1.5 Testing en Testnet

- [ ] **Crear un flake de prueba desde el backend**
- [ ] **Depositar stakes usando wallet de prueba**
- [ ] **Ejecutar resolución como Oracle**
- [ ] **Verificar distribución de fondos**
- [ ] **Probar flujo de refunds**

### 1.6 Deployment a Base Mainnet (Producción)

- [ ] **SOLO DESPUÉS DE TESTING EXHAUSTIVO EN TESTNET**

- [ ] **Auditoría de seguridad**
  - [ ] Contratar auditoría externa (recomendado: OpenZeppelin, Trail of Bits, ConsenSys Diligence)
  - [ ] Revisar recomendaciones y aplicar fixes

- [ ] **Deployment a mainnet**
  ```bash
  forge script script/DeployFleakEscrow.s.sol:DeployFleakEscrow \
    --rpc-url $BASE_MAINNET_RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY \
    --broadcast \
    --verify
  ```

- [ ] **Transferir ownership si es necesario**
  ```bash
  cast send <CONTRACT_ADDRESS> \
    "transferOwnership(address)" <NEW_OWNER_ADDRESS> \
    --private-key $DEPLOYER_PRIVATE_KEY \
    --rpc-url $BASE_MAINNET_RPC_URL
  ```

- [ ] **Documentar dirección de contrato en mainnet**

---

## 🚀 **PARTE 2: Backend (Next.js)**

### 2.1 Configuración Inicial

- [ ] **Navegar al proyecto backend**
  ```bash
  cd /home/saul/Documentos/proyectos/batches/fleak-internal-dev
  ```

- [ ] **Verificar versión de Node.js**
  ```bash
  node --version  # Debe ser >= 18.x
  ```

- [ ] **Instalar dependencias**
  ```bash
  npm install
  ```

### 2.2 Variables de Entorno

- [ ] **Crear archivo `.env.local`**
  ```bash
  cp .env.example .env.local
  ```

- [ ] **Completar todas las variables requeridas:**

#### MongoDB
- [ ] `MONGODB_URI`: URI de MongoDB (Atlas o local)
  - Si usas Atlas: https://www.mongodb.com/cloud/atlas/register
  - Crear cluster gratuito y obtener connection string
  - Formato: `mongodb+srv://user:password@cluster.mongodb.net/fleak?retryWrites=true&w=majority`

#### Pinata (IPFS)
- [ ] `PINATA_JWT`: JWT Token de Pinata
  - Registrarse en https://app.pinata.cloud/
  - Generar API Key en https://app.pinata.cloud/developers/api-keys
- [ ] `PINATA_API_KEY`: API Key legacy
- [ ] `PINATA_SECRET`: Secret legacy
  - Ambos se obtienen al generar una API key

#### Google Gemini AI
- [ ] `API_KEY_GEMINI`: API Key de Google AI
  - Obtener en https://ai.google.dev/
  - Crear proyecto en Google Cloud Console
  - Habilitar Generative AI API
  - Crear API Key

#### Autenticación
- [ ] `SESSION_SECRET`: Secret para JWT (mínimo 32 caracteres)
  - Generar: `openssl rand -base64 32`
  - Ejemplo: `7Kj8mN2pQ5rS9tU1vW3xY4zA6bC8dE0fG2hI4jK6lM8=`

#### Blockchain
- [ ] `ORACLE_PRIVATE_KEY`: Private key de la wallet Oracle
  - **IMPORTANTE**: Esta wallet ejecutará transacciones on-chain
  - Debe ser la **misma wallet** configurada en el contrato
  - Formato: `0x` + 64 caracteres hexadecimales
  - **NUNCA** commitear al repositorio
  - En producción: usar gestores de secretos (AWS Secrets Manager, Vault, etc)

- [ ] `CONTRACT_ADDRESS`: Dirección del contrato FleakEscrow deployado
  - Copiar desde el output del deployment en Foundry
  - Formato: `0x` + 40 caracteres hexadecimales

- [ ] `CONTRACT_CHAIN_ID`: Chain ID de la red
  - Base Sepolia (testnet): `84532`
  - Base Mainnet: `8453`

#### Aplicación
- [ ] `NODE_ENV`: `development` | `production` | `test`
- [ ] `NEXT_PUBLIC_URL`: URL pública del backend
  - Local: `http://localhost:3000`
  - Producción: `https://api.fleak.app` (ejemplo)

### 2.3 Base de Datos

- [ ] **Verificar conexión a MongoDB**
  ```bash
  npm run dev
  # Revisar logs: "MongoDB connected successfully"
  ```

- [ ] **Ejecutar migraciones si hay flakes existentes**
  - Ver `docs/contract_integration.md` sección "Migraciones Necesarias"
  - Script de ejemplo:
  ```javascript
  // scripts/migrate-flakes.js
  const { connectToDatabase } = require('./lib/db');
  const { FlakeModel } = require('./lib/models/Flake');

  async function migrate() {
    await connectToDatabase();
    
    // Agregar campos faltantes
    await FlakeModel.updateMany(
      { feeBps: { $exists: false } },
      { 
        $set: { 
          feeBps: 0,
          feeRecipient: null,
          onChainCreationTxHash: null,
          resolutionTxHash: null,
          refundOpenedTxHash: null
        }
      }
    );
    
    console.log('Migration completed');
  }

  migrate();
  ```

- [ ] **Crear índices en MongoDB**
  - Los índices se crean automáticamente al iniciar la app (definidos en el Schema)
  - Verificar con MongoDB Compass o shell:
  ```javascript
  db.flakes.getIndexes()
  ```

### 2.4 Testing Local

- [ ] **Ejecutar en modo desarrollo**
  ```bash
  npm run dev
  ```

- [ ] **Probar endpoints básicos:**
  - [ ] `GET /api/auth` - Health check
  - [ ] `POST /api/auth/login` - Login (requiere token de MiniKit)
  - [ ] `POST /api/flakes/create` - Crear flake
  - [ ] `POST /api/flakes/deposit-intent` - Generar calldata
  - [ ] `POST /api/flakes/resolve` - Resolver (como Oracle)

- [ ] **Verificar logs de errores**
  - Sin errores de TypeScript
  - Sin errores de conexión a MongoDB
  - Sin errores de autenticación

- [ ] **Probar integración con contrato en testnet:**
  - [ ] Crear flake off-chain
  - [ ] Generar calldata para stake
  - [ ] Ejecutar stake on-chain usando wallet de prueba
  - [ ] Confirmar depósito en backend
  - [ ] Ejecutar resolución como Oracle
  - [ ] Verificar distribución en blockchain

### 2.5 Build para Producción

- [ ] **Compilar proyecto**
  ```bash
  npm run build
  ```

- [ ] **Verificar que no hay errores de build**
  - TypeScript compile OK
  - Next.js build OK
  - Todas las rutas generadas correctamente

- [ ] **Probar build localmente**
  ```bash
  npm run start
  ```

### 2.6 Deployment Backend

#### Opción A: Vercel (Recomendado para Next.js)

- [ ] **Crear cuenta en Vercel**
  - https://vercel.com/signup

- [ ] **Conectar repositorio GitHub**
  - Importar proyecto desde GitHub

- [ ] **Configurar variables de entorno en Vercel**
  - Settings → Environment Variables
  - Agregar todas las variables de `.env.local`
  - **IMPORTANTE**: Usar variables diferentes para Production/Preview/Development

- [ ] **Configurar dominios**
  - Settings → Domains
  - Agregar dominio personalizado (ejemplo: `api.fleak.app`)

- [ ] **Deploy**
  - Vercel auto-deploya en cada push a `main`
  - Verificar deployment exitoso

- [ ] **Probar endpoints en producción**

#### Opción B: Railway / Render / AWS / GCP

- [ ] **Configurar plataforma elegida**
- [ ] **Configurar variables de entorno**
- [ ] **Configurar build commands:**
  - Build: `npm run build`
  - Start: `npm run start`
- [ ] **Deploy**

### 2.7 Monitoreo & Logs

- [ ] **Configurar servicio de logs**
  - Vercel tiene logs integrados
  - Alternativas: Datadog, Sentry, LogRocket

- [ ] **Configurar alertas**
  - Errores de Oracle (transacciones fallidas)
  - Errores de conexión a MongoDB
  - Errores de APIs externas (Pinata, Gemini)

- [ ] **Configurar métricas**
  - Flakes creados por día
  - Resolutions ejecutadas
  - Refunds procesados

### 2.8 Seguridad

- [ ] **Configurar CORS**
  - Solo permitir orígenes autorizados
  - Ver `next.config.ts`

- [ ] **Rate limiting**
  - Implementar límites por IP
  - Proteger endpoints de Oracle

- [ ] **Validar inputs**
  - Todos los endpoints usan Zod para validación
  - Verificar que no falten validaciones

- [ ] **Secrets management**
  - `ORACLE_PRIVATE_KEY` en gestor de secretos
  - Rotar secrets periódicamente

- [ ] **HTTPS obligatorio**
  - Vercel provee HTTPS automático
  - Si usas otra plataforma, configurar SSL

### 2.9 Documentación

- [ ] **Actualizar README.md**
  - Instrucciones de instalación
  - Variables de entorno requeridas
  - Comandos básicos

- [ ] **Documentar API endpoints**
  - Ver `docs/backend_api.md`
  - Agregar ejemplos de requests/responses

- [ ] **Crear runbook de operaciones**
  - Cómo ejecutar resoluciones manuales
  - Cómo abrir refunds en emergencia
  - Cómo rotar Oracle key

---

## 🔄 **PARTE 3: Integración End-to-End**

### 3.1 Verificación de Integración

- [ ] **Flujo completo: Crear → Depositar → Resolver**
  1. Frontend crea flake via `POST /api/flakes/create`
  2. Usuario deposita stake on-chain
  3. Frontend confirma depósito via `POST /api/flakes/deposit-confirm`
  4. Backend verifica stake on-chain con `readStakeOnChain`
  5. Backend ejecuta resolución con `executeResolveFlake`
  6. Frontend muestra resultado

- [ ] **Flujo completo: Crear → Depositar → Refund**
  1. Crear flake y depositar
  2. Backend abre refunds con `executeOpenRefunds`
  3. Participantes reclaman con `withdrawRefund` (frontend)
  4. Backend confirma claims

- [ ] **Verificar consistencia de datos**
  - Estado en MongoDB coincide con estado on-chain
  - Balances correctos
  - Transacciones confirmadas

### 3.2 Testing de Usuario Final

- [ ] **Automatic Flakes**
  - [ ] Crear flake automático
  - [ ] Recibir deep link `fleak://set-alarm?...`
  - [ ] Abrir app nativa (React Native)
  - [ ] Completar verificación automática
  - [ ] Recibir recompensa

- [ ] **Social Flakes**
  - [ ] Crear flake social
  - [ ] Invitar amigos como attestors
  - [ ] Amigos votan (approved/rejected)
  - [ ] Resolución basada en mayoría

- [ ] **AI Flakes**
  - [ ] Crear flake con verificación AI
  - [ ] Subir evidencia (imagen/video)
  - [ ] Gemini analiza evidencia
  - [ ] Resolución basada en score AI

### 3.3 Performance

- [ ] **Optimizar queries de MongoDB**
  - Usar índices apropiados
  - Evitar full table scans

- [ ] **Caching**
  - Cache de flake status
  - Cache de participant stakes

- [ ] **Rate limiting en RPC**
  - No hacer requests excesivos a Base RPC
  - Considerar usar Alchemy/Infura con rate limits mayores

---

## 📝 **PARTE 4: Documentación & Handoff**

### 4.1 Documentación Técnica

- [ ] **README completo**
- [ ] **API documentation**
- [ ] **Contract documentation**
- [ ] **Architecture diagrams**
- [ ] **Data flow diagrams**

### 4.2 Guías de Usuario

- [ ] **How to create a Flake**
- [ ] **How to stake**
- [ ] **How to claim refunds**
- [ ] **FAQ**

### 4.3 Runbooks de Operaciones

- [ ] **Deployment runbook**
- [ ] **Incident response plan**
- [ ] **Disaster recovery plan**
- [ ] **Oracle key rotation procedure**

---

## ✅ **PARTE 5: Checklist Final Pre-Launch**

### Para Testnet
- [ ] Contratos deployados y verificados en Base Sepolia
- [ ] Backend deployado y funcionando
- [ ] Al menos 10 flakes de prueba ejecutados exitosamente
- [ ] Todos los flujos testeados manualmente
- [ ] Zero errores críticos en logs

### Para Mainnet
- [ ] ✅ Todo lo de testnet completado
- [ ] Auditoría de contratos completada
- [ ] Fixes de auditoría implementados
- [ ] Oracle wallet fondeada adecuadamente
- [ ] Monitoring & alerting configurado
- [ ] Backups de MongoDB configurados
- [ ] Disaster recovery plan documentado
- [ ] Legal/compliance review completado
- [ ] Terms of Service publicados
- [ ] Privacy Policy publicada

---

## 🆘 **Troubleshooting Común**

### MongoDB no conecta
```bash
# Verificar URI
echo $MONGODB_URI
# Probar conexión con mongosh
mongosh "$MONGODB_URI"
```

### Oracle transactions failing
```bash
# Verificar balance del Oracle
cast balance <ORACLE_ADDRESS> --rpc-url <RPC_URL>
# Verificar que Oracle address en contrato es correcto
cast call <CONTRACT_ADDRESS> "oracle()(address)" --rpc-url <RPC_URL>
```

### Build failures
```bash
# Limpiar cache
rm -rf .next
npm run build
```

### TypeScript errors
```bash
# Regenerar types
npm run build
# Verificar versiones de dependencias
npm list typescript viem
```

---

## 📞 **Contactos & Recursos**

- **Documentación del proyecto**: `docs/`
- **Contract integration**: `docs/contract_integration.md`
- **API reference**: `docs/backend_api.md`
- **Base Network docs**: https://docs.base.org/
- **Foundry docs**: https://book.getfoundry.sh/
- **Next.js docs**: https://nextjs.org/docs

---

**Última actualización**: 2025-10-24  
**Versión**: 1.0.0
