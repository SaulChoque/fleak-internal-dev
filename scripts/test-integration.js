#!/usr/bin/env node
/**
 * Script de integración completa Backend ↔ Smart Contract
 * 
 * Prueba el flujo completo:
 * 1. Crear Flake on-chain
 * 2. Depositar stake
 * 3. Resolver Flake como Oracle
 * 4. Verificar estado final
 * 5. Test de openRefunds
 */

const { createWalletClient, createPublicClient, http, parseEther } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { baseSepolia } = require('viem/chains');

// Cargar variables de entorno
require('dotenv').config({ path: '.env' });

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;

// ABI del contrato FleakEscrow
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
    name: "withdrawRefund",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "flakeId", type: "uint256" }],
    outputs: [{ name: "amount", type: "uint256" }],
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
  {
    name: "oracle",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
];

// Estados del Flake (enum State en el contrato)
const FlakeState = {
  ACTIVE: 0,
  RESOLVED: 1,
  CANCELLED: 2,
};

async function main() {
  console.log('🧪 INICIANDO TESTS DE INTEGRACIÓN BACKEND ↔ SMART CONTRACT\n');
  console.log('═'.repeat(70));
  console.log('');

  // Validaciones iniciales
  if (!CONTRACT_ADDRESS) {
    console.error('❌ CONTRACT_ADDRESS no definido en .env');
    process.exit(1);
  }

  if (!ORACLE_PRIVATE_KEY) {
    console.error('❌ ORACLE_PRIVATE_KEY no definido en .env');
    process.exit(1);
  }

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
  console.log(`   Oracle:   ${oracleAccount.address}`);
  console.log(`   Chain:    Base Sepolia (${baseSepolia.id})\n`);

  // Verificar Oracle
  console.log('🔍 Verificando Oracle...');
  const contractOracle = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: FLEAK_ABI,
    functionName: 'oracle',
  });

  if (contractOracle.toLowerCase() !== oracleAccount.address.toLowerCase()) {
    console.error(`❌ Oracle mismatch:`);
    console.error(`   Contrato: ${contractOracle}`);
    console.error(`   Wallet:   ${oracleAccount.address}`);
    process.exit(1);
  }
  console.log('✅ Oracle verificado\n');

  // Generar datos de prueba
  const testFlakeId = BigInt(Date.now()); // ID único basado en timestamp
  const stakeAmount = parseEther('0.001'); // 0.001 ETH por participante
  const feeRecipient = '0x0000000000000000000000000000000000000000'; // Sin fees por ahora
  
  // Direcciones de prueba (usaremos el Oracle como participante para simplicidad)
  const testParticipants = [oracleAccount.address];

  console.log('📊 Datos de prueba:');
  console.log(`   Flake ID:      ${testFlakeId}`);
  console.log(`   Stake Amount:  ${stakeAmount} wei (0.001 ETH)`);
  console.log(`   Participantes: ${testParticipants.length}`);
  console.log(`   Fee Recipient: ${feeRecipient}\n`);

  let testResults = {
    createFlake: false,
    stake: false,
    resolveFlake: false,
    stateValidation: false,
    openRefunds: false,
  };

  try {
    // ========================================================================
    // TEST 1: CREATE FLAKE
    // ========================================================================
    console.log('🏗️  TEST 1: Crear Flake on-chain');
    console.log('─'.repeat(50));

    const createHash = await oracleWallet.writeContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'createFlake',
      args: [
        testFlakeId,
        testParticipants,
        0, // feeBps = 0%
        feeRecipient,
        oracleAccount.address, // initialStakeRecipient
      ],
      value: stakeAmount,
      chain: baseSepolia,
    });

    console.log(`📤 Tx enviada: ${createHash}`);
    const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createHash });
    console.log(`✅ Confirmada en bloque: ${createReceipt.blockNumber}`);

    // Verificar que el Flake fue creado
    const flakeData = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'getFlake',
      args: [testFlakeId],
    });

    console.log(`📊 Estado del Flake:`);
    console.log(`   Creator:       ${flakeData.creator}`);
    console.log(`   State:         ${flakeData.state} (${flakeData.state === FlakeState.ACTIVE ? 'ACTIVE' : 'OTHER'})`);
    console.log(`   Lifetime Stake: ${flakeData.lifetimeStake} wei`);
    console.log(`   Current Stake:  ${flakeData.currentStake} wei`);

    if (flakeData.state === FlakeState.ACTIVE && flakeData.lifetimeStake > 0n) {
      console.log('✅ TEST 1 PASADO: Flake creado correctamente\n');
      testResults.createFlake = true;
    } else {
      console.log('❌ TEST 1 FALLIDO: Estado del Flake inesperado\n');
    }

    // ========================================================================
    // TEST 2: STAKE ADICIONAL
    // ========================================================================
    console.log('💰 TEST 2: Depositar stake adicional');
    console.log('─'.repeat(50));

    const stakeHash = await oracleWallet.writeContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'stake',
      args: [testFlakeId, oracleAccount.address],
      value: stakeAmount,
      chain: baseSepolia,
    });

    console.log(`📤 Tx enviada: ${stakeHash}`);
    const stakeReceipt = await publicClient.waitForTransactionReceipt({ hash: stakeHash });
    console.log(`✅ Confirmada en bloque: ${stakeReceipt.blockNumber}`);

    // Verificar stake actualizado
    const userStake = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'stakeOf',
      args: [testFlakeId, oracleAccount.address],
    });

    console.log(`📊 Stake del usuario: ${userStake} wei`);

    const expectedStake = stakeAmount * 2n; // createFlake + stake
    if (userStake >= expectedStake) {
      console.log('✅ TEST 2 PASADO: Stake adicional registrado correctamente\n');
      testResults.stake = true;
    } else {
      console.log(`❌ TEST 2 FALLIDO: Stake esperado ${expectedStake}, actual ${userStake}\n`);
    }

    // ========================================================================
    // TEST 3: RESOLVE FLAKE (COMO ORACLE)
    // ========================================================================
    console.log('🏆 TEST 3: Resolver Flake como Oracle');
    console.log('─'.repeat(50));

    const resolveHash = await oracleWallet.writeContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'resolveFlake',
      args: [testFlakeId, oracleAccount.address], // Oracle se declara ganador
      chain: baseSepolia,
    });

    console.log(`📤 Tx enviada: ${resolveHash}`);
    const resolveReceipt = await publicClient.waitForTransactionReceipt({ hash: resolveHash });
    console.log(`✅ Confirmada en bloque: ${resolveReceipt.blockNumber}`);

    // Verificar estado después de resolución
    const resolvedFlakeData = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'getFlake',
      args: [testFlakeId],
    });

    console.log(`📊 Estado post-resolución:`);
    console.log(`   State:          ${resolvedFlakeData.state} (${resolvedFlakeData.state === FlakeState.RESOLVED ? 'RESOLVED' : 'OTHER'})`);
    console.log(`   Winner:         ${resolvedFlakeData.winner}`);
    console.log(`   Distributed:    ${resolvedFlakeData.distributedPayout} wei`);
    console.log(`   Resolved At:    ${resolvedFlakeData.resolvedAt}`);

    if (
      resolvedFlakeData.state === FlakeState.RESOLVED &&
      resolvedFlakeData.winner.toLowerCase() === oracleAccount.address.toLowerCase() &&
      resolvedFlakeData.distributedPayout > 0n
    ) {
      console.log('✅ TEST 3 PASADO: Flake resuelto correctamente por Oracle\n');
      testResults.resolveFlake = true;
      testResults.stateValidation = true;
    } else {
      console.log('❌ TEST 3 FALLIDO: Resolución inesperada\n');
    }

    // ========================================================================
    // TEST 4: OPEN REFUNDS (NUEVO FLAKE PARA CANCELACIÓN)
    // ========================================================================
    console.log('🔄 TEST 4: Open Refunds como Oracle');
    console.log('─'.repeat(50));

    // Crear un segundo Flake para probar openRefunds
    const refundFlakeId = testFlakeId + 1n;
    
    const refundCreateHash = await oracleWallet.writeContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'createFlake',
      args: [
        refundFlakeId,
        testParticipants,
        0,
        feeRecipient,
        oracleAccount.address,
      ],
      value: stakeAmount,
      chain: baseSepolia,
    });

    console.log(`📤 Creando Flake para refund: ${refundCreateHash}`);
    await publicClient.waitForTransactionReceipt({ hash: refundCreateHash });

    // Abrir refunds (cancela el Flake)
    const openRefundsHash = await oracleWallet.writeContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'openRefunds',
      args: [refundFlakeId],
      chain: baseSepolia,
    });

    console.log(`📤 Tx openRefunds enviada: ${openRefundsHash}`);
    const refundsReceipt = await publicClient.waitForTransactionReceipt({ hash: openRefundsHash });
    console.log(`✅ Confirmada en bloque: ${refundsReceipt.blockNumber}`);

    // Verificar estado después de openRefunds
    const cancelledFlakeData = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: FLEAK_ABI,
      functionName: 'getFlake',
      args: [refundFlakeId],
    });

    console.log(`📊 Estado post-openRefunds:`);
    console.log(`   State:        ${cancelledFlakeData.state} (${cancelledFlakeData.state === FlakeState.CANCELLED ? 'CANCELLED' : 'OTHER'})`);
    console.log(`   Cancelled At: ${cancelledFlakeData.cancelledAt}`);

    if (cancelledFlakeData.state === FlakeState.CANCELLED) {
      console.log('✅ TEST 4 PASADO: OpenRefunds ejecutado correctamente por Oracle\n');
      testResults.openRefunds = true;
    } else {
      console.log('❌ TEST 4 FALLIDO: Estado después de openRefunds inesperado\n');
    }

  } catch (error) {
    console.error('❌ Error durante los tests:', error.message);
    if (error.details) {
      console.error('   Detalles:', error.details);
    }
    process.exit(1);
  }

  // ========================================================================
  // RESUMEN FINAL
  // ========================================================================
  console.log('═'.repeat(70));
  console.log('📋 RESUMEN DE TESTS DE INTEGRACIÓN');
  console.log('═'.repeat(70));

  const tests = [
    { name: 'Create Flake', status: testResults.createFlake },
    { name: 'Stake Additional', status: testResults.stake },
    { name: 'Resolve Flake (Oracle)', status: testResults.resolveFlake },
    { name: 'State Validation', status: testResults.stateValidation },
    { name: 'Open Refunds (Oracle)', status: testResults.openRefunds },
  ];

  tests.forEach((test, i) => {
    const icon = test.status ? '✅' : '❌';
    console.log(`${i + 1}. ${icon} ${test.name}`);
  });

  const passedTests = tests.filter(t => t.status).length;
  const totalTests = tests.length;

  console.log('');
  console.log(`📊 Resultado: ${passedTests}/${totalTests} tests pasaron`);

  if (passedTests === totalTests) {
    console.log('🎉 ¡TODOS LOS TESTS PASARON!');
    console.log('   El backend puede integrar completamente con el smart contract.');
    console.log('   Las operaciones de Oracle (resolveFlake, openRefunds) funcionan correctamente.');
    console.log('');
    console.log('✅ SISTEMA LISTO PARA INTEGRACIÓN CON FRONTEND');
  } else {
    console.log('⚠️  Algunos tests fallaron. Revisar la integración antes de continuar.');
    process.exit(1);
  }

  console.log('═'.repeat(70));
}

main().catch((error) => {
  console.error('💥 Error crítico:', error);
  process.exit(1);
});