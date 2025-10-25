#!/usr/bin/env node
/**
 * Test de integración completo y funcional Backend ↔ Smart Contract
 * Corregido después del diagnóstico
 */

const { createWalletClient, createPublicClient, http, parseEther } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { baseSepolia } = require('viem/chains');

require('dotenv').config({ path: '.env' });

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;

// ABI completa
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

const FlakeState = { ACTIVE: 1, RESOLVED: 2, CANCELLED: 3 };

async function main() {
  console.log('🧪 TEST DE INTEGRACIÓN BACKEND ↔ SMART CONTRACT');
  console.log('═'.repeat(60));
  console.log('');

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const oracleAccount = privateKeyToAccount(ORACLE_PRIVATE_KEY);
  const oracleWallet = createWalletClient({
    account: oracleAccount,
    chain: baseSepolia,
    transport: http(),
  });

  console.log('📋 Configuración:');
  console.log(`   Contrato: ${CONTRACT_ADDRESS}`);
  console.log(`   Oracle:   ${oracleAccount.address}\n`);

  // Generar IDs únicos para evitar colisiones
  const baseId = Date.now();
  const testFlakeId = BigInt(baseId + 1);
  const refundFlakeId = BigInt(baseId + 2);
  const stakeAmount = parseEther('0.001');

  console.log('📊 IDs de prueba:');
  console.log(`   Test Flake:   ${testFlakeId}`);
  console.log(`   Refund Flake: ${refundFlakeId}`);
  console.log(`   Stake:        0.001 ETH\n`);

  let results = { passed: 0, failed: 0, tests: [] };

  // ========================================================================
  // TEST 1: CREATE FLAKE + INITIAL STAKE
  // ========================================================================
  console.log('🏗️  TEST 1: Create Flake + Initial Stake');
  console.log('─'.repeat(45));

  try {
    const createHash = await oracleWallet.writeContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'createFlake',
      args: [
        testFlakeId,
        [oracleAccount.address],
        0, // 0% fee
        '0x0000000000000000000000000000000000000000',
        oracleAccount.address,
      ],
      value: stakeAmount,
      chain: baseSepolia,
    });

    console.log(`📤 Tx: ${createHash}`);
    await publicClient.waitForTransactionReceipt({ hash: createHash });

    const flakeData = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'getFlake',
      args: [testFlakeId],
    });

    const userStake = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'stakeOf',
      args: [testFlakeId, oracleAccount.address],
    });

    console.log(`✅ Estado: ${flakeData.state === FlakeState.ACTIVE ? 'ACTIVE' : `State: ${flakeData.state}`}`);
    console.log(`✅ Lifetime Stake: ${flakeData.lifetimeStake} wei`);
    console.log(`✅ User Stake: ${userStake} wei`);

    if (flakeData.state === FlakeState.ACTIVE && userStake === stakeAmount) {
      results.passed++;
      results.tests.push('✅ Create Flake');
      console.log('🎯 TEST 1 PASADO\n');
    } else {
      results.failed++;
      results.tests.push('❌ Create Flake');
      console.log('❌ TEST 1 FALLIDO\n');
    }

  } catch (error) {
    results.failed++;
    results.tests.push('❌ Create Flake');
    console.log(`❌ Error: ${error.message}\n`);
  }

  // ========================================================================
  // TEST 2: ADDITIONAL STAKE
  // ========================================================================
  console.log('💰 TEST 2: Additional Stake');
  console.log('─'.repeat(45));

  try {
    const stakeHash = await oracleWallet.writeContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'stake',
      args: [testFlakeId, oracleAccount.address],
      value: stakeAmount,
      chain: baseSepolia,
    });

    console.log(`📤 Tx: ${stakeHash}`);
    await publicClient.waitForTransactionReceipt({ hash: stakeHash });

    const newStake = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'stakeOf',
      args: [testFlakeId, oracleAccount.address],
    });

    const expectedStake = stakeAmount * 2n;
    console.log(`✅ New Stake: ${newStake} wei`);
    console.log(`✅ Expected: ${expectedStake} wei`);

    if (newStake === expectedStake) {
      results.passed++;
      results.tests.push('✅ Additional Stake');
      console.log('🎯 TEST 2 PASADO\n');
    } else {
      results.failed++;
      results.tests.push('❌ Additional Stake');
      console.log('❌ TEST 2 FALLIDO\n');
    }

  } catch (error) {
    results.failed++;
    results.tests.push('❌ Additional Stake');
    console.log(`❌ Error: ${error.message}\n`);
  }

  // ========================================================================
  // TEST 3: RESOLVE FLAKE (ORACLE)
  // ========================================================================
  console.log('🏆 TEST 3: Resolve Flake (Oracle)');
  console.log('─'.repeat(45));

  try {
    const resolveHash = await oracleWallet.writeContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'resolveFlake',
      args: [testFlakeId, oracleAccount.address],
      chain: baseSepolia,
    });

    console.log(`📤 Tx: ${resolveHash}`);
    await publicClient.waitForTransactionReceipt({ hash: resolveHash });

    const resolvedData = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'getFlake',
      args: [testFlakeId],
    });

    console.log(`✅ State: ${resolvedData.state === FlakeState.RESOLVED ? 'RESOLVED' : `State: ${resolvedData.state}`}`);
    console.log(`✅ Winner: ${resolvedData.winner}`);
    console.log(`✅ Distributed: ${resolvedData.distributedPayout} wei`);

    if (
      resolvedData.state === FlakeState.RESOLVED &&
      resolvedData.winner.toLowerCase() === oracleAccount.address.toLowerCase() &&
      resolvedData.distributedPayout > 0n
    ) {
      results.passed++;
      results.tests.push('✅ Resolve Flake');
      console.log('🎯 TEST 3 PASADO\n');
    } else {
      results.failed++;
      results.tests.push('❌ Resolve Flake');
      console.log('❌ TEST 3 FALLIDO\n');
    }

  } catch (error) {
    results.failed++;
    results.tests.push('❌ Resolve Flake');
    console.log(`❌ Error: ${error.message}\n`);
  }

  // ========================================================================
  // TEST 4: OPEN REFUNDS (ORACLE)
  // ========================================================================
  console.log('🔄 TEST 4: Open Refunds (Oracle)');
  console.log('─'.repeat(45));

  try {
    // Crear un segundo Flake para cancelar
    const createRefundHash = await oracleWallet.writeContract({
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
      chain: baseSepolia,
    });

    console.log(`📤 Create para refund: ${createRefundHash}`);
    await publicClient.waitForTransactionReceipt({ hash: createRefundHash });

    // Abrir refunds (cancelar)
    const refundHash = await oracleWallet.writeContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'openRefunds',
      args: [refundFlakeId],
      chain: baseSepolia,
    });

    console.log(`📤 Open refunds: ${refundHash}`);
    await publicClient.waitForTransactionReceipt({ hash: refundHash });

    const cancelledData = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'getFlake',
      args: [refundFlakeId],
    });

    console.log(`✅ State: ${cancelledData.state === FlakeState.CANCELLED ? 'CANCELLED' : `State: ${cancelledData.state}`}`);
    console.log(`✅ Cancelled At: ${cancelledData.cancelledAt}`);

    if (cancelledData.state === FlakeState.CANCELLED) {
      results.passed++;
      results.tests.push('✅ Open Refunds');
      console.log('🎯 TEST 4 PASADO\n');
    } else {
      results.failed++;
      results.tests.push('❌ Open Refunds');
      console.log('❌ TEST 4 FALLIDO\n');
    }

  } catch (error) {
    results.failed++;
    results.tests.push('❌ Open Refunds');
    console.log(`❌ Error: ${error.message}\n`);
  }

  // ========================================================================
  // RESUMEN FINAL
  // ========================================================================
  console.log('═'.repeat(60));
  console.log('📋 RESUMEN DE INTEGRACIÓN');
  console.log('═'.repeat(60));

  results.tests.forEach((test, i) => {
    console.log(`${i + 1}. ${test}`);
  });

  console.log('');
  console.log(`📊 Resultado: ${results.passed}/${results.passed + results.failed} tests pasaron`);

  if (results.failed === 0) {
    console.log('');
    console.log('🎉 ¡TODOS LOS TESTS DE INTEGRACIÓN PASARON!');
    console.log('');
    console.log('✅ Funciones verificadas:');
    console.log('   • createFlake() - Crear Flakes con stake inicial');
    console.log('   • stake() - Depositar stakes adicionales');
    console.log('   • resolveFlake() - Resolver como Oracle');
    console.log('   • openRefunds() - Cancelar y abrir reembolsos como Oracle');
    console.log('   • getFlake() - Leer estado on-chain');
    console.log('   • stakeOf() - Leer stakes de participantes');
    console.log('');
    console.log('🚀 EL BACKEND ESTÁ LISTO PARA INTEGRACIÓN CON FRONTEND');
    console.log('');
    console.log('📝 Próximos pasos recomendados:');
    console.log('   1. Integrar con las rutas de la API (POST /api/flakes/create, etc.)');
    console.log('   2. Probar flujos end-to-end desde el frontend');
    console.log('   3. Configurar monitoreo de balance del Oracle');
    console.log('   4. Documentar los gas costs observados');
    console.log('');
  } else {
    console.log('⚠️  Algunos tests fallaron. Revisar antes de continuar.');
    process.exit(1);
  }

  console.log('═'.repeat(60));
}

main().catch((error) => {
  console.error('💥 Error crítico:', error);
  process.exit(1);
});