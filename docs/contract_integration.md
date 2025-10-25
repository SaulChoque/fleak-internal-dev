# Integración del Contrato FleakEscrow con el Backend

Este documento describe las correcciones y mejoras implementadas para integrar correctamente el contrato `FleakEscrow` con el backend de Fleak.

## Problemas Identificados y Corregidos

### 1. ABI Incorrecta en `blockchain.ts`

**Problema**: El backend usaba una función `deposit(flakeId)` que no existe en el contrato. El contrato real usa `stake(flakeId, beneficiary)`.

**Solución**: Se actualizó el archivo `lib/server/blockchain.ts` con el ABI completo del contrato:

```typescript
- deposit(flakeId)                          // ❌ No existe
+ stake(flakeId, beneficiary)               // ✅ Función correcta
+ createFlake(...)                          // ✅ Nueva función
+ openRefunds(flakeId)                      // ✅ Nueva función
+ getFlake(flakeId)                         // ✅ Vista on-chain
+ stakeOf(flakeId, participant)             // ✅ Vista on-chain
```

### 2. Falta de Soporte para Parámetro `beneficiary`

**Problema**: El contrato permite que cualquier dirección deposite en nombre de otra (parámetro `beneficiary`), pero el backend no lo soportaba.

**Solución**: 
- Se actualizó `createDepositIntent` para aceptar `walletAddress` opcional
- Se usa `buildStakeCalldata(flakeId, beneficiary)` con la dirección correcta
- Si no se provee wallet, se usa `address(0)` para que el contrato use `msg.sender`

### 3. Modelo de Datos Incompleto

**Problema**: El modelo `Flake` no incluía campos necesarios para tracking completo del ciclo de vida on-chain.

**Solución**: Se agregaron campos al modelo:

```typescript
// Nuevos campos en FlakeDocument
feeBps: number;                    // Comisión en basis points (0-1000 = 0-10%)
feeRecipient?: string;             // Dirección que recibe la comisión
creatorWalletAddress?: string;     // Wallet del creador
onChainCreationTxHash?: string;    // Hash de tx de createFlake
resolutionTxHash?: string;         // Hash de tx de resolveFlake
refundOpenedTxHash?: string;       // Hash de tx de openRefunds

// Nuevos campos en Participant
walletAddress?: string;            // Wallet del participante
refundTxHash?: string;             // Hash de tx de withdrawRefund

// Nuevo estado en FlakeStatus
"REFUNDING"                        // Estado cuando refunds están abiertos
```

### 4. Flujo de Reembolsos No Implementado

**Problema**: El contrato soporta reembolsos mediante `openRefunds` y `withdrawRefund`, pero no había endpoints ni lógica en el backend.

**Solución**: Se implementaron nuevas funciones y endpoints:

**Funciones en `flakeService.ts`:**
```typescript
openRefunds(flakeId)              // Cambia estado a REFUNDING y genera calldata
markRefundOpened(flakeId, txHash) // Registra el hash de apertura de refunds
markRefundClaimed(flakeId, userFid, txHash) // Marca refund reclamado
```

**Endpoints nuevos:**
- `POST /api/flakes/refund-open` - Inicia el proceso de refund
- `POST /api/flakes/refund-confirm` - Confirma apertura o reclamo de refund

### 5. Funciones Helper Mejoradas

Se agregaron funciones para construir calldata de todas las operaciones del contrato:

```typescript
buildCreateFlakeCalldata({...})    // Para crear flake on-chain
buildStakeCalldata(id, beneficiary) // Para depositar con beneficiario
buildResolveCalldata(id, winner)    // Para resolver flake
buildOpenRefundsCalldata(id)        // Para abrir refunds
buildDepositCalldata(id)            // Wrapper de compatibilidad
```

## Flujos de Integración Actualizados

### Flujo 1: Creación de Flake

```
1. Frontend → POST /api/flakes/create
2. Backend → Crea documento en MongoDB
3. Backend → (OPCIONAL) Genera calldata con buildCreateFlakeCalldata
4. Backend → Retorna flake + deepLink (si automatic)
5. Frontend → (OPCIONAL) Usuario firma tx de createFlake on-chain
6. Frontend → (OPCIONAL) POST /api/flakes/creation-confirm con txHash
```

**Nota**: La creación on-chain puede ser opcional o delegada al primer depósito.

### Flujo 2: Depósito (Stake)

```
1. Frontend → POST /api/flakes/deposit-intent
   - Envía: flakeId, amount, walletAddress (opcional)
2. Backend → createDepositIntent genera:
   - calldata usando buildStakeCalldata(id, beneficiary)
   - value (monto a depositar)
   - contractAddress, chainId
3. Frontend → Usuario firma tx con wallet
4. Frontend → POST /api/flakes/deposit-confirm con txHash
5. Backend → markDepositConfirmed actualiza participante a "STAKED"
```

### Flujo 3: Resolución

```
1. Backend → Agrega attestations hasta cumplir condiciones
2. Backend → POST /api/flakes/resolve (Oracle)
   - Envía: flakeId, winnerFid, winnerAddress
3. Backend → markResolution genera calldata
4. Backend → Firma y envía tx de resolveFlake
5. Backend → Actualiza estado a "RESOLVED" y marca ganador
6. Contrato → Distribuye fondos: payout + fee
```

### Flujo 4: Reembolsos (NUEVO)

```
1. Backend → Detecta condición de cancelación
2. Backend → POST /api/flakes/refund-open
3. Backend → openRefunds cambia estado a "REFUNDING"
4. Backend → Firma y envía tx de openRefunds al contrato
5. Backend → POST /api/flakes/refund-confirm (action: "opened")
6. Frontend → Muestra UI para que participantes reclamen
7. Usuario → Ejecuta withdrawRefund desde frontend
8. Frontend → POST /api/flakes/refund-confirm (action: "claimed")
9. Backend → Marca participante como "REFUNDED"
```

## Compatibilidad con Eventos del Contrato

El contrato emite estos eventos que el backend puede indexar:

| Evento | Uso Backend |
|--------|-------------|
| `FlakeCreated` | Confirmar creación on-chain, registrar txHash |
| `StakeAdded` | Actualizar saldos sin esperar confirmación API |
| `FlakeResolved` | Verificar distribución correcta de fondos |
| `FlakeRefundOpened` | Confirmar apertura de refunds |
| `RefundClaimed` | Sincronizar claims individuales |

## Estructura de Fees

El contrato soporta comisiones protocolarias:

- `feeBps`: 0-1000 (0% - 10% en basis points)
- `feeRecipient`: Dirección que recibe la comisión
- Al resolver, el contrato calcula: `fee = totalStake * feeBps / 10_000`
- Distribuye: `payout` al ganador + `fee` al recipient

El backend ahora almacena estos valores para transparencia y auditoría.

## Migraciones Necesarias

Si ya existen flakes en la base de datos, ejecutar:

```javascript
// Agregar campos por defecto a documentos existentes
db.flakes.updateMany(
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

// Agregar walletAddress a participantes si es necesario
db.flakes.updateMany(
  { "participants.walletAddress": { $exists: false } },
  { 
    $set: { "participants.$[].walletAddress": null, "participants.$[].refundTxHash": null }
  }
);
```

## Testing Recomendado

1. **Test de depósito con beneficiary**:
   - Alice deposita en nombre de Bob
   - Verificar que el stake se acredita a Bob

2. **Test de resolución con fees**:
   - Crear flake con feeBps = 500 (5%)
   - Resolver y verificar distribución correcta

3. **Test de refunds**:
   - Abrir refunds en un flake activo
   - Verificar que participantes pueden reclamar
   - Verificar que no se puede reclamar dos veces

4. **Test de integración completa**:
   - Crear → Depositar → Resolver
   - Crear → Depositar → Refund
   - Verificar sincronización MongoDB ↔ Blockchain

## Mejoras Futuras Sugeridas

1. **Indexador de eventos**: Escuchar eventos del contrato para actualizar MongoDB automáticamente
2. **Validación on-chain**: Leer `getFlake()` antes de marcar resolved para garantizar consistencia
3. **Multi-Oracle**: Soportar múltiples oracles para descentralización
4. **Circuit breaker**: Implementar pausas de emergencia en el contrato
5. **Soporte ERC20**: Extender para aceptar tokens además de ETH nativo

## Conclusión

La integración ahora refleja correctamente el contrato `FleakEscrow`:

✅ ABI completa y correcta  
✅ Soporte para `stake(flakeId, beneficiary)`  
✅ Tracking de fees y recipients  
✅ Flujo completo de refunds  
✅ Campos para todos los hashes de transacciones  
✅ Estados sincronizados con el contrato  

La arquitectura permite escalar hacia indexación automática de eventos y verificación on-chain robusta.
