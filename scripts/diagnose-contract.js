#!/usr/bin/env node
/**
 * Script de diagnóstico simple para entender por qué falló createFlake
 */

const { createWalletClient, createPublicClient, http, parseEther } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { baseSepolia } = require('viem/chains');

require('dotenv').config({ path: '.env' });

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;

// ABI mínima para diagnóstico
const MINIMAL_ABI = [
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
];

async function main() {
  console.log('🔍 DIAGNÓSTICO: Verificando por qué falló createFlake\n');

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

  console.log(`📋 Contrato: ${CONTRACT_ADDRESS}`);
  console.log(`📋 Oracle:   ${oracleAccount.address}\n`);

  // Verificar balance del Oracle
  const balance = await publicClient.getBalance({ address: oracleAccount.address });
  console.log(`💰 Balance Oracle: ${balance} wei (${Number(balance) / 1e18} ETH)`);

  if (balance < parseEther('0.001')) {
    console.log('⚠️  Balance bajo, pero debería ser suficiente para el test\n');
  } else {
    console.log('✅ Balance suficiente\n');
  }

  // Obtener el último recibo de transacción para analizar
  console.log('📜 Analizando la transacción fallida...');
  
  try {
    const receipt = await publicClient.getTransactionReceipt({ 
      hash: '0x1173556470b582c81ff7c19e6134ce20c44ee9839cd16bd6a30763e0b03b9a8e' 
    });

    console.log(`📊 Receipt de la tx fallida:`);
    console.log(`   Status: ${receipt.status}`);
    console.log(`   Gas Used: ${receipt.gasUsed}`);
    console.log(`   Block: ${receipt.blockNumber}`);

    if (receipt.status === 'reverted') {
      console.log('❌ La transacción REVIRTIÓ - createFlake falló\n');
    } else if (receipt.status === 'success') {
      console.log('✅ La transacción fue exitosa, pero getFlake falla\n');
    }

    // Mostrar logs si los hay
    if (receipt.logs && receipt.logs.length > 0) {
      console.log(`📋 Logs (${receipt.logs.length}):`);
      receipt.logs.forEach((log, i) => {
        console.log(`   ${i + 1}. Topics: ${log.topics.length}, Data: ${log.data.slice(0, 20)}...`);
      });
    } else {
      console.log('📋 Sin logs emitidos');
    }

  } catch (e) {
    console.log(`❌ No se pudo obtener receipt: ${e.message}`);
  }

  console.log('\n🧪 Intentando createFlake con ID más simple...');
  
  const simpleFlakeId = 999n;
  const stakeAmount = parseEther('0.001');

  try {
    console.log(`📤 Enviando createFlake con ID: ${simpleFlakeId}`);
    
    const hash = await oracleWallet.writeContract({
      address: CONTRACT_ADDRESS,
      abi: MINIMAL_ABI,
      functionName: 'createFlake',
      args: [
        simpleFlakeId,
        [oracleAccount.address], // expectedParticipants
        0, // feeBps
        '0x0000000000000000000000000000000000000000', // feeRecipient
        oracleAccount.address, // initialStakeRecipient
      ],
      value: stakeAmount,
      chain: baseSepolia,
    });

    console.log(`📤 Hash: ${hash}`);
    console.log('⏳ Esperando confirmación...');

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    console.log(`📋 Status: ${receipt.status}`);
    console.log(`📋 Gas usado: ${receipt.gasUsed}`);
    console.log(`📋 Bloque: ${receipt.blockNumber}`);

    if (receipt.status === 'success') {
      console.log('✅ CreateFlake exitoso, intentando getFlake...\n');

      // Esperar un momento y luego intentar leer
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const flakeData = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: MINIMAL_ABI,
          functionName: 'getFlake',
          args: [simpleFlakeId],
        });

        console.log('✅ ¡GetFlake exitoso!');
        console.log(`📊 Creator: ${flakeData.creator}`);
        console.log(`📊 State: ${flakeData.state}`);
        console.log(`📊 Lifetime Stake: ${flakeData.lifetimeStake}`);
        console.log('\n🎉 ¡El contrato funciona correctamente!');

      } catch (readError) {
        console.log(`❌ GetFlake falló: ${readError.message}`);
        
        if (readError.message.includes('FlakeMissing')) {
          console.log('\n🤔 El Flake no existe después de createFlake.');
          console.log('   Posibles causas:');
          console.log('   1. createFlake revirtió silenciosamente');
          console.log('   2. ID de Flake tiene restricciones que no conocemos');
          console.log('   3. Bug en el contrato');
        }
      }
    } else {
      console.log('❌ CreateFlake falló');
    }

  } catch (error) {
    console.error('❌ Error en createFlake:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('💡 Problema: Balance insuficiente');
    } else if (error.message.includes('execution reverted')) {
      console.log('💡 Problema: Transacción revirtió por lógica del contrato');
    }
  }
}

main().catch(console.error);