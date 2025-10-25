#!/usr/bin/env node
/**
 * Script para actualizar la dirección Oracle en el contrato
 * REQUIERE: DEPLOYER_PRIVATE_KEY (la clave del owner del contrato)
 */

const { createWalletClient, createPublicClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { baseSepolia } = require('viem/chains');

// Cargar variables de entorno
require('dotenv').config({ path: '.env' });

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const NEW_ORACLE_ADDRESS = process.argv[2];

// ABI mínima para setOracle
const MINIMAL_ABI = [
  {
    name: 'setOracle',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newOracle', type: 'address' }],
    outputs: [],
  },
  {
    name: 'oracle',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
];

async function main() {
  console.log('🔄 Actualizando dirección Oracle en el contrato...\n');

  // Validaciones
  if (!DEPLOYER_PRIVATE_KEY) {
    console.error('❌ DEPLOYER_PRIVATE_KEY no está definida en .env');
    console.log('   Esta es la private key del owner/deployer del contrato.\n');
    process.exit(1);
  }

  if (!CONTRACT_ADDRESS) {
    console.error('❌ CONTRACT_ADDRESS no está definida en .env');
    process.exit(1);
  }

  if (!NEW_ORACLE_ADDRESS) {
    console.error('❌ Falta argumento: dirección del nuevo Oracle');
    console.log('\nUso:');
    console.log('  node scripts/update-oracle.js <NEW_ORACLE_ADDRESS>\n');
    console.log('Ejemplo:');
    console.log('  node scripts/update-oracle.js 0x0f26475928053737C3CCb143Ef9B28F8eDab04C7\n');
    process.exit(1);
  }

  // Validar formato de dirección
  if (!/^0x[a-fA-F0-9]{40}$/.test(NEW_ORACLE_ADDRESS)) {
    console.error('❌ Dirección inválida. Debe ser formato 0x... (40 caracteres hex)');
    process.exit(1);
  }

  try {
    // Crear wallet client con la clave del deployer
    const account = privateKeyToAccount(DEPLOYER_PRIVATE_KEY);
    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(),
    });

    // Public client para lecturas y para esperar receipt
    const publicClient = createPublicClient({ chain: baseSepolia, transport: http() });

    console.log('📝 Información:');
    console.log(`   Owner/Deployer: ${account.address}`);
    console.log(`   Contrato:       ${CONTRACT_ADDRESS}`);
    console.log(`   Nuevo Oracle:   ${NEW_ORACLE_ADDRESS}\n`);

    // Leer Oracle actual
    const currentOracle = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: MINIMAL_ABI,
      functionName: 'oracle',
    });

    console.log(`📌 Oracle actual:  ${currentOracle}\n`);

    if (currentOracle.toLowerCase() === NEW_ORACLE_ADDRESS.toLowerCase()) {
      console.log('ℹ️  El Oracle ya está configurado con esta dirección. No hay cambios.\n');
      process.exit(0);
    }

    // Confirmar con el usuario
    console.log('⚠️  ¿Estás seguro de que quieres cambiar el Oracle?');
    console.log('   Esta es una operación crítica que solo puede hacer el owner.\n');
    console.log('   Presiona Ctrl+C para cancelar, o espera 5 segundos para continuar...\n');

    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log('📤 Enviando transacción setOracle()...\n');

    // Ejecutar setOracle
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: MINIMAL_ABI,
      functionName: 'setOracle',
      args: [NEW_ORACLE_ADDRESS],
      chain: baseSepolia,
    });

    console.log(`✅ Transacción enviada: ${hash}`);
    console.log(`   Esperando confirmación...\n`);

  // Esperar confirmación
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === 'success') {
      console.log('✅ ¡ÉXITO! Oracle actualizado.');
      console.log(`   Tx confirmada en bloque: ${receipt.blockNumber}\n`);

      // Verificar el cambio
      const newOracle = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: MINIMAL_ABI,
        functionName: 'oracle',
      });

      console.log('📌 Verificación:');
      console.log(`   Oracle en contrato: ${newOracle}`);
      console.log(`   Esperado:           ${NEW_ORACLE_ADDRESS}`);

      if (newOracle.toLowerCase() === NEW_ORACLE_ADDRESS.toLowerCase()) {
        console.log('\n✅ Verificación exitosa. El Oracle ha sido actualizado correctamente.\n');
      } else {
        console.log('\n⚠️  Advertencia: La verificación no coincide.\n');
      }
    } else {
      console.log('❌ La transacción falló.');
      console.log(`   Estado: ${receipt.status}\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (error.message.includes('NotOwner')) {
      console.log('\n📝 La cuenta no es el owner del contrato.');
      console.log('   Solo el owner puede cambiar el Oracle.');
      console.log('   Verifica que DEPLOYER_PRIVATE_KEY sea la clave correcta.\n');
    }

    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error inesperado:', error);
  process.exit(1);
});
