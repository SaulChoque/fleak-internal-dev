#!/usr/bin/env node
/**
 * Test de integración completa simplificado
 * Verificar que todos los servicios están operativos juntos
 */

require('dotenv').config({ path: '.env' });

async function quickIntegrationTest() {
  console.log('🧪 TEST INTEGRACIÓN RÁPIDA - BACKEND FLEAK');
  console.log('═'.repeat(50));
  console.log('');

  let successCount = 0;
  const totalTests = 4;

  // 1. Smart Contract (conexión básica)
  console.log('⛓️  Test 1: Smart Contract Base');
  try {
    const { createPublicClient, http } = require('viem');
    const { baseSepolia } = require('viem/chains');

    const client = createPublicClient({
      chain: baseSepolia,
      transport: http()
    });

    const blockNumber = await client.getBlockNumber();
    console.log(`✅ Base Sepolia - Bloque: ${blockNumber}`);
    successCount++;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // 2. Google Gemini
  console.log('\n🤖 Test 2: Google Gemini');
  try {
    const API_KEY = process.env.API_KEY_GEMINI;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Responde solo: OK" }] }]
        })
      }
    );

    const data = await response.json();
    if (data.candidates?.[0]?.content) {
      console.log('✅ Gemini API respondiendo');
      successCount++;
    } else {
      throw new Error('Respuesta inválida');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // 3. Pinata IPFS
  console.log('\n📎 Test 3: Pinata IPFS');
  try {
    const PINATA_JWT = process.env.PINATA_JWT;
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      headers: { 'Authorization': `Bearer ${PINATA_JWT}` }
    });

    const data = await response.json();
    if (data.message?.includes('Congratulations')) {
      console.log('✅ Pinata autenticado');
      successCount++;
    } else {
      throw new Error('Auth fallida');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // 4. MongoDB
  console.log('\n🗄️  Test 4: MongoDB');
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI, { 
      serverSelectionTimeoutMS: 5000 
    });
    
    console.log('✅ MongoDB conectado');
    await mongoose.disconnect();
    successCount++;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // Resumen
  console.log('\n' + '═'.repeat(50));
  console.log('📊 RESUMEN FINAL');
  console.log('═'.repeat(50));
  
  console.log(`📈 Servicios operativos: ${successCount}/${totalTests}`);

  if (successCount === totalTests) {
    console.log('\n🎉 ¡TODOS LOS SERVICIOS OPERATIVOS!');
    console.log('\n✅ BACKEND 100% LISTO PARA FRONTEND');
    console.log('\n📋 Servicios certificados:');
    console.log('   • ⛓️  Smart Contracts (Base Sepolia)');
    console.log('   • 🤖 Google Gemini (IA Analysis)');
    console.log('   • 📎 Pinata Cloud (IPFS Storage)');
    console.log('   • 🗄️  MongoDB Atlas (Database)');
    console.log('\n🚀 READY PARA INTEGRACIÓN FRONTEND');
  } else {
    console.log('\n⚠️  Algunos servicios fallaron');
    console.log(`\n📊 Éxito: ${Math.round((successCount/totalTests)*100)}%`);
  }

  console.log('\n' + '═'.repeat(50));
  
  return successCount === totalTests;
}

async function main() {
  const success = await quickIntegrationTest();
  process.exit(success ? 0 : 1);
}

main().catch(console.error);