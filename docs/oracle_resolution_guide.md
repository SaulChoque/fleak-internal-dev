# Guía de Resolución: Mismatch de Oracle

## Problema Detectado

Durante las validaciones pre-deployment se detectó que la dirección derivada desde `ORACLE_PRIVATE_KEY` **NO coincide** con la dirección Oracle configurada en el contrato inteligente.

### Estado Actual

```
✅ Dirección derivada desde ORACLE_PRIVATE_KEY:
   0x0f26475928053737C3CCb143Ef9B28F8eDab04C7

✅ Dirección Oracle almacenada en el contrato:
   0xc8F81DC7D52Af1E6ec16eE0765fb67A800450D68

❌ Las direcciones NO coinciden
```

**Impacto**: El backend NO puede ejecutar transacciones como Oracle hasta que se resuelva este problema.

Funciones bloqueadas:
- `resolveFlake()` - No se pueden resolver Flakes
- `openRefunds()` - No se pueden abrir reembolsos

---

## Soluciones Disponibles

Tienes dos opciones para resolver el problema:

### Opción A: Actualizar el Oracle en el Contrato

**Cuándo usar**: Si tienes acceso a la private key del **owner/deployer** del contrato y quieres mantener la `ORACLE_PRIVATE_KEY` actual.

#### Pasos:

1. **Agrega la clave del deployer a `.env`**:
   ```bash
   DEPLOYER_PRIVATE_KEY=0x... # La private key con la que desplegaste el contrato
   ```

2. **Ejecuta el script de actualización**:
   ```bash
   node scripts/update-oracle.js 0x0f26475928053737C3CCb143Ef9B28F8eDab04C7
   ```

3. **El script hará**:
   - Validar que tengas permisos de owner
   - Mostrar el Oracle actual vs el nuevo
   - Esperar 5 segundos para que confirmes
   - Ejecutar `setOracle()` on-chain
   - Esperar confirmación de la transacción
   - Verificar que el cambio se aplicó correctamente

4. **Verifica el resultado**:
   ```bash
   node scripts/verify-oracle.js
   ```
   Deberías ver: `✅ Las direcciones coinciden`

#### Ventajas:
- Mantienes la private key actual del Oracle
- No necesitas cambiar configuración

#### Desventajas:
- Requiere acceso a la private key del owner
- Requiere gas fees para la transacción
- Requiere esperar confirmación on-chain

---

### Opción B: Cambiar ORACLE_PRIVATE_KEY

**Cuándo usar**: Si tienes acceso a la private key de la dirección `0xc8F81DC7D52Af1E6ec16eE0765fb67A800450D68` (el Oracle que ya está configurado en el contrato).

#### Pasos:

1. **Reemplaza la private key en `.env`**:
   ```bash
   # Antigua (no coincide):
   # ORACLE_PRIVATE_KEY=0xf1f0b805524fea3b1f028732baa9c50380cff58a9ec048cb20f039888fd8626d

   # Nueva (la que deriva a 0xc8F81DC7D52Af1E6ec16eE0765fb67A800450D68):
   ORACLE_PRIVATE_KEY=0x[TU_CLAVE_AQUI]
   ```

2. **Verifica el resultado**:
   ```bash
   node scripts/verify-oracle.js
   ```
   Deberías ver: `✅ Las direcciones coinciden`

#### Ventajas:
- Inmediato (no requiere transacción)
- Sin costos de gas
- Sin esperas

#### Desventajas:
- Requiere tener la private key correcta
- Si no la tienes, no puedes usar esta opción

---

## Scripts de Verificación

### verify-oracle.js

**Ubicación**: `scripts/verify-oracle.js`

**Propósito**: Validar que el Oracle esté correctamente configurado.

**Uso**:
```bash
node scripts/verify-oracle.js
```

**Output exitoso**:
```
✅ Dirección derivada desde ORACLE_PRIVATE_KEY:
   0x0f26475928053737C3CCb143Ef9B28F8eDab04C7

✅ Dirección Oracle almacenada en el contrato:
   0x0f26475928053737C3CCb143Ef9B28F8eDab04C7

✅ Las direcciones coinciden correctamente
```

---

### update-oracle.js

**Ubicación**: `scripts/update-oracle.js`

**Propósito**: Actualizar la dirección Oracle en el contrato (requiere ser owner).

**Uso**:
```bash
node scripts/update-oracle.js <NUEVA_DIRECCION_ORACLE>
```

**Ejemplo**:
```bash
node scripts/update-oracle.js 0x0f26475928053737C3CCb143Ef9B28F8eDab04C7
```

**Requisitos**:
- Variable `DEPLOYER_PRIVATE_KEY` en `.env`
- Ser el owner del contrato
- Tener ETH en Base Sepolia para gas

**Proceso**:
1. Deriva la dirección del deployer desde la private key
2. Lee el Oracle actual del contrato
3. Muestra comparación y espera 5 segundos
4. Envía transacción `setOracle(nuevaDireccion)`
5. Espera confirmación on-chain
6. Verifica que el cambio se aplicó

---

## Checklist de Resolución

Después de aplicar cualquiera de las dos soluciones, verifica:

- [ ] `node scripts/verify-oracle.js` muestra ✅ coincidencia
- [ ] `npm run build` compila sin errores
- [ ] Prueba de integración con frontend exitosa
- [ ] Documenta cuál solución aplicaste en el changelog

---

## Información Técnica

### ¿Por qué ocurrió este problema?

Posibles causas:
1. El contrato se desplegó con una dirección Oracle diferente a la que ahora tienes en `.env`
2. La `ORACLE_PRIVATE_KEY` se rotó pero no se actualizó en el contrato
3. Se copió una private key incorrecta al archivo `.env`

### ¿Qué pasa si no lo resuelvo?

El backend no podrá:
- Ejecutar `resolveFlake()` para distribuir stakes después de la verificación
- Ejecutar `openRefunds()` para permitir reembolsos cuando una Flake falla
- Cualquier operación que requiera el rol de Oracle en el contrato

Los usuarios verán:
- Flakes que nunca se resuelven
- Stakes bloqueados permanentemente
- Imposibilidad de reclamar reembolsos

### Funciones del contrato afectadas

```solidity
// Estas funciones requieren msg.sender == oracle
function resolveFlake(uint256 flakeId, address winner) external;
function openRefunds(uint256 flakeId) external;
```

Ambas tienen el modifier `onlyOracle`:
```solidity
modifier onlyOracle() {
    if (msg.sender != oracle) revert NotOracle();
    _;
}
```

---

## Troubleshooting

### Error: "NotOwner" al ejecutar update-oracle.js

**Causa**: La `DEPLOYER_PRIVATE_KEY` no corresponde al owner del contrato.

**Solución**:
1. Verifica que tengas la private key correcta del deployer
2. Consulta el owner actual ejecutando:
   ```javascript
   // En un script temporal
   const owner = await publicClient.readContract({
     address: CONTRACT_ADDRESS,
     abi: [{ name: 'owner', type: 'function', ... }],
     functionName: 'owner'
   });
   console.log('Owner actual:', owner);
   ```

### Error: "Insufficient funds"

**Causa**: La wallet del deployer no tiene ETH en Base Sepolia.

**Solución**:
1. Obtén ETH de testnet desde: https://www.alchemy.com/faucets/base-sepolia
2. Envía al menos 0.01 ETH a la dirección del deployer

### Verificación muestra error de RPC

**Causa**: No se puede conectar a Base Sepolia.

**Solución**:
1. Verifica tu conexión a internet
2. Prueba con un RPC alternativo (Alchemy, Infura)
3. Revisa que `CONTRACT_CHAIN_ID=84532` sea correcto

---

## Próximos Pasos

Una vez resuelto el Oracle:

1. ✅ Ejecutar validaciones completas:
   ```bash
   node scripts/verify-oracle.js
   npm run build
   ```

2. ✅ Probar flujos críticos con el frontend:
   - Crear Flake → Stake → Verificación → Resolución
   - Verificar que las transacciones del Oracle se ejecuten

3. ✅ Actualizar documentación:
   - Agregar la solución aplicada al `DEPLOYMENT_CHECKLIST.md`
   - Documentar en changelog interno

4. ✅ Monitoreo:
   - Revisar balance del Oracle wallet regularmente
   - Configurar alertas si el balance baja de 0.01 ETH
