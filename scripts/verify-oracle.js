#!/usr/bin/env node
/**
 * Script de verificación del Oracle
 * Verifica que ORACLE_PRIVATE_KEY coincida con la dirección oracle() del contrato
 */

const { createPublicClient, createWalletClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { baseSepolia } = require('viem/chains');

// Cargar variables de entorno
require('dotenv').config({ path: '.env' });

const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CHAIN_ID = parseInt(process.env.CONTRACT_CHAIN_ID || '84532');

// ABI mínima para leer oracle()
const MINIMAL_ABI = [
  {
    name: 'oracle',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
];

async function main() {
  console.log('🔍 Verificando configuración del Oracle...\n');

  // 1. Validar que las variables existen
  if (!ORACLE_PRIVATE_KEY) {
    console.error('❌ ORACLE_PRIVATE_KEY no está definida en .env');
    process.exit(1);
  }

  if (!CONTRACT_ADDRESS) {
    console.error('❌ CONTRACT_ADDRESS no está definida en .env');
    process.exit(1);
  }

  // 2. Derivar dirección desde private key
  let derivedAddress;
  try {
    const account = privateKeyToAccount(ORACLE_PRIVATE_KEY);
    derivedAddress = account.address;
    console.log('✅ Dirección derivada desde ORACLE_PRIVATE_KEY:');
    console.log(`   ${derivedAddress}\n`);
  } catch (error) {
    console.error('❌ Error al derivar dirección desde ORACLE_PRIVATE_KEY:');
    console.error(`   ${error.message}`);
    process.exit(1);
  }

  // 3. Leer oracle() del contrato
  console.log(`🔗 Conectando al contrato en Base Sepolia (Chain ID: ${CHAIN_ID})...`);
  console.log(`   Contrato: ${CONTRACT_ADDRESS}\n`);

  try {
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    const oracleAddress = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: MINIMAL_ABI,
      functionName: 'oracle',
    });

    console.log('✅ Dirección Oracle almacenada en el contrato:');
    console.log(`   ${oracleAddress}\n`);

    // 4. Comparar direcciones
    if (derivedAddress.toLowerCase() === oracleAddress.toLowerCase()) {
      console.log('✅ ¡PERFECTO! Las direcciones coinciden.');
      console.log('   El backend puede ejecutar resolveFlake() y openRefunds().\n');
    } else {
      console.log('❌ ERROR: Las direcciones NO coinciden.');
      console.log('   El backend NO podrá ejecutar transacciones como Oracle.');
      console.log('\n📝 Solución:');
      console.log('   1. Si quieres usar la private key actual, actualiza el Oracle en el contrato:');
      console.log(`      - Como owner, llama setOracle("${derivedAddress}")`);
      console.log('   2. O cambia ORACLE_PRIVATE_KEY a la clave cuya dirección es:');
      console.log(`      ${oracleAddress}\n`);
      process.exit(1);
    }

    // 5. Verificar balance del Oracle
    const balance = await publicClient.getBalance({ address: derivedAddress });
    const balanceEth = Number(balance) / 1e18;

    console.log('💰 Balance del Oracle:');
    console.log(`   ${balanceEth.toFixed(6)} ETH`);

    if (balanceEth < 0.001) {
      console.log('\n⚠️  ADVERTENCIA: Balance muy bajo.');
      console.log('   El Oracle necesita ETH para ejecutar transacciones (resolveFlake, openRefunds).');
      console.log('   Recomendado: al menos 0.01 ETH en testnet.\n');
    } else {
      console.log('   ✅ Balance suficiente para pruebas.\n');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ VERIFICACIÓN COMPLETA - TODO LISTO PARA PRUEBAS');
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Error al leer del contrato:');
    console.error(`   ${error.message}`);
    console.log('\n📝 Posibles causas:');
    console.log('   - CONTRACT_ADDRESS incorrecto');
    console.log('   - Contrato no deployado en Base Sepolia');
    console.log('   - Problemas de red (RPC no responde)');
    console.log('   - El contrato no tiene la función oracle()');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error inesperado:', error);
  process.exit(1);
});
