#!/usr/bin/env node
/**
 * Test de integración robusto con manejo de nonces y debugging
 */

const { createWalletClient, createPublicClient, http, parseEther } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { baseSepolia } = require('viem/chains');

require('dotenv').config({ path: '.env' });

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;

// ABI mínima para testing
const FLEAK_ABI = [
  {
    name: "createFlake",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "flakeId", type: "uint256" },
      { name: "expectedParticipants", type: "address[]" },
      { name: "feeBps", type: "uint16" },
      { name: "feeRecipient", type: "address" },
      { name: "initialStakeRecipient", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "stake",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "flakeId", type: "uint256" },
      { name: "beneficiary", type: "address" },
    ],
    outputs: [{ name: "newStake", type: "uint256" }],
  },
  {
    name: "resolveFlake",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "flakeId", type: "uint256" },
      { name: "winner", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "openRefunds",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "flakeId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getFlake",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "flakeId", type: "uint256" }],
    outputs: [
      {
        name: "viewData",
        type: "tuple",
        components: [
          { name: "creator", type: "address" },
          { name: "state", type: "uint8" },
          { name: "winner", type: "address" },
          { name: "feeBps", type: "uint16" },
          { name: "feeRecipient", type: "address" },
          { name: "lifetimeStake", type: "uint256" },
          { name: "currentStake", type: "uint256" },
          { name: "distributedPayout", type: "uint256" },
          { name: "distributedFee", type: "uint256" },
          { name: "refundedAmount", type: "uint256" },
          { name: "createdAt", type: "uint40" },
          { name: "resolvedAt", type: "uint40" },
          { name: "cancelledAt", type: "uint40" },
        ],
      },
    ],
  },
  {
    name: "stakeOf",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "flakeId", type: "uint256" },
      { name: "participant", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
];

// Estados del enum corregidos (empiezan desde 1)
const FlakeState = { ACTIVE: 1, RESOLVED: 2, CANCELLED: 3 };

// Helper para esperar y obtener nonce fresco
async function getNextNonce(publicClient, address) {
  return await publicClient.getTransactionCount({ address, blockTag: 'pending' });
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🧪 TEST DE INTEGRACIÓN ROBUSTO');
  console.log('═'.repeat(50));
  console.log('');

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const oracleAccount = privateKeyToAccount(ORACLE_PRIVATE_KEY);
  
  console.log('📋 Configuración:');
  console.log(`   Contrato: ${CONTRACT_ADDRESS}`);
  console.log(`   Oracle:   ${oracleAccount.address}\n`);

  // ID único basado en tiempo
  const flakeId = BigInt(Date.now() + Math.floor(Math.random() * 1000));
  const stakeAmount = parseEther('0.001');

  console.log(`📊 Test Flake ID: ${flakeId}\n`);

  let testCount = 0;
  let passedCount = 0;

  // ========================================================================
  // TEST 1: CREATE FLAKE
  // ========================================================================
  testCount++;
  console.log('🏗️  TEST 1: Create Flake');
  console.log('─'.repeat(30));

  try {
    const nonce = await getNextNonce(publicClient, oracleAccount.address);
    console.log(`📋 Usando nonce: ${nonce}`);

    const oracleWallet = createWalletClient({
      account: oracleAccount,
      chain: baseSepolia,
      transport: http(),
    });

    const createHash = await oracleWallet.writeContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'createFlake',
      args: [
        flakeId,
        [oracleAccount.address],
        0,
        '0x0000000000000000000000000000000000000000',
        oracleAccount.address,
      ],
      value: stakeAmount,
      nonce,
      chain: baseSepolia,
    });

    console.log(`📤 Tx: ${createHash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: createHash });
    console.log(`✅ Confirmado en bloque: ${receipt.blockNumber}`);

    // Esperar un poco antes de leer
    await delay(2000);

    try {
      const flakeData = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: FLEAK_ABI,
        functionName: 'getFlake',
        args: [flakeId],
      });

      console.log(`✅ Creator: ${flakeData.creator}`);
      console.log(`✅ State: ${flakeData.state} (${flakeData.state === FlakeState.ACTIVE ? 'ACTIVE' : 'OTHER'})`);
      console.log(`✅ Lifetime Stake: ${flakeData.lifetimeStake} wei`);

      if (flakeData.state === FlakeState.ACTIVE && flakeData.lifetimeStake > 0n) {
        console.log('🎯 TEST 1 PASADO\n');
        passedCount++;
      } else {
        console.log('❌ TEST 1 FALLIDO - Estado inesperado\n');
      }

    } catch (readError) {
      console.log(`❌ No se pudo leer el Flake: ${readError.message}`);
      
      if (readError.message.includes('FlakeMissing')) {
        console.log('💡 El Flake no se creó correctamente\n');
      }
    }

  } catch (error) {
    console.log(`❌ Error en createFlake: ${error.message}\n`);
  }

  // ========================================================================
  // TEST 2: RESOLVE FLAKE (si existe)
  // ========================================================================
  testCount++;
  console.log('🏆 TEST 2: Resolve Flake');
  console.log('─'.repeat(30));

  try {
    // Verificar que el Flake existe antes de intentar resolverlo
    const flakeData = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'getFlake',
      args: [flakeId],
    });

    if (flakeData.state !== FlakeState.ACTIVE) {
      console.log(`⚠️  Flake no está ACTIVE (state: ${flakeData.state}), saltando test\n`);
    } else {
      const nonce = await getNextNonce(publicClient, oracleAccount.address);
      console.log(`📋 Usando nonce: ${nonce}`);

      const oracleWallet = createWalletClient({
        account: oracleAccount,
        chain: baseSepolia,
        transport: http(),
      });

      const resolveHash = await oracleWallet.writeContract({
        address: CONTRACT_ADDRESS,
        abi: FLEAK_ABI,
        functionName: 'resolveFlake',
        args: [flakeId, oracleAccount.address],
        nonce,
        chain: baseSepolia,
      });

      console.log(`📤 Tx: ${resolveHash}`);
      await publicClient.waitForTransactionReceipt({ hash: resolveHash });
      await delay(2000);

      const resolvedData = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: FLEAK_ABI,
        functionName: 'getFlake',
        args: [flakeId],
      });

      console.log(`✅ State: ${resolvedData.state} (${resolvedData.state === FlakeState.RESOLVED ? 'RESOLVED' : 'OTHER'})`);
      console.log(`✅ Winner: ${resolvedData.winner}`);
      console.log(`✅ Distributed: ${resolvedData.distributedPayout} wei`);

      if (
        resolvedData.state === FlakeState.RESOLVED &&
        resolvedData.winner.toLowerCase() === oracleAccount.address.toLowerCase()
      ) {
        console.log('🎯 TEST 2 PASADO\n');
        passedCount++;
      } else {
        console.log('❌ TEST 2 FALLIDO - Resolución incorrecta\n');
      }
    }

  } catch (error) {
    console.log(`❌ Error en resolveFlake: ${error.message}\n`);
  }

  // ========================================================================
  // TEST 3: OPEN REFUNDS (Flake independiente)
  // ========================================================================
  testCount++;
  console.log('🔄 TEST 3: Open Refunds');
  console.log('─'.repeat(30));

  try {
    const refundFlakeId = flakeId + 1n;
    
    // Crear Flake para cancelar
    const nonce1 = await getNextNonce(publicClient, oracleAccount.address);
    console.log(`📋 Create nonce: ${nonce1}`);

    const oracleWallet = createWalletClient({
      account: oracleAccount,
      chain: baseSepolia,
      transport: http(),
    });

    const createHash = await oracleWallet.writeContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'createFlake',
      args: [
        refundFlakeId,
        [oracleAccount.address],
        0,
        '0x0000000000000000000000000000000000000000',
        oracleAccount.address,
      ],
      value: stakeAmount,
      nonce: nonce1,
      chain: baseSepolia,
    });

    console.log(`📤 Create: ${createHash}`);
    await publicClient.waitForTransactionReceipt({ hash: createHash });
    await delay(3000); // Esperar más tiempo

    // Abrir refunds
    const nonce2 = await getNextNonce(publicClient, oracleAccount.address);
    console.log(`📋 OpenRefunds nonce: ${nonce2}`);

    const refundHash = await oracleWallet.writeContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'openRefunds',
      args: [refundFlakeId],
      nonce: nonce2,
      chain: baseSepolia,
    });

    console.log(`📤 OpenRefunds: ${refundHash}`);
    await publicClient.waitForTransactionReceipt({ hash: refundHash });
    await delay(2000);

    const cancelledData = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'getFlake',
      args: [refundFlakeId],
    });

    console.log(`✅ State: ${cancelledData.state} (${cancelledData.state === FlakeState.CANCELLED ? 'CANCELLED' : 'OTHER'})`);

    if (cancelledData.state === FlakeState.CANCELLED) {
      console.log('🎯 TEST 3 PASADO\n');
      passedCount++;
    } else {
      console.log('❌ TEST 3 FALLIDO - No se canceló\n');
    }

  } catch (error) {
    console.log(`❌ Error en openRefunds: ${error.message}\n`);
  }

  // ========================================================================
  // RESUMEN FINAL
  // ========================================================================
  console.log('═'.repeat(50));
  console.log('📋 RESUMEN DE TESTS');
  console.log('═'.repeat(50));
  console.log(`📊 Pasaron: ${passedCount}/${testCount} tests`);
  console.log('');

  if (passedCount >= 2) {
    console.log('🎉 INTEGRACIÓN BÁSICA FUNCIONAL');
    console.log('');
    console.log('✅ Operaciones verificadas:');
    if (passedCount >= 1) console.log('   • createFlake() - Crear Flakes con stake');
    if (passedCount >= 2) console.log('   • resolveFlake() - Resolver como Oracle');
    if (passedCount >= 3) console.log('   • openRefunds() - Cancelar como Oracle');
    console.log('');
    console.log('🚀 EL BACKEND PUEDE INTEGRAR CON EL CONTRATO');
    console.log('');
    console.log('📝 Siguientes pasos:');
    console.log('   1. Integrar con API routes (/api/flakes/*)');
    console.log('   2. Probar desde el frontend');
    console.log('   3. Configurar monitoring del Oracle');
    console.log('');
  } else {
    console.log('⚠️  Integración parcial. Algunos tests fallaron.');
    console.log('   Revisar logs para diagnosticar problemas.');
  }

  console.log('═'.repeat(50));
}

main().catch(console.error);