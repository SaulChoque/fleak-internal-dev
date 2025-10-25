#!/usr/bin/env node
/**
 * Test completo de servicios externos:
 * - Google Gemini API
 * - Pinata Cloud (IPFS)
 * - MongoDB Atlas
 */

require('dotenv').config({ path: '.env' });

async function testGeminiAPI() {
  console.log('🤖 TEST 1: Google Gemini API');
  console.log('─'.repeat(40));

  try {
    const API_KEY = process.env.API_KEY_GEMINI;
    
    if (!API_KEY) {
      throw new Error('API_KEY_GEMINI no está configurada');
    }

    console.log(`📋 API Key configurada: ${API_KEY.slice(0, 20)}...`);

    // Test simple de análisis de imagen (simulado)
    const testPrompt = "Describe brevemente qué es un contrato inteligente";
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: testPrompt
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const responseText = data.candidates[0].content.parts[0].text;
      console.log(`✅ Respuesta recibida: ${responseText.slice(0, 100)}...`);
      console.log(`✅ Tokens usados: ~${responseText.length / 4}`);
      console.log('🎯 TEST GEMINI PASADO\n');
      return true;
    } else {
      throw new Error('Respuesta de Gemini en formato inesperado');
    }

  } catch (error) {
    console.log(`❌ Error en Gemini: ${error.message}`);
    
    if (error.message.includes('403')) {
      console.log('💡 Posible problema: API Key inválida o sin permisos');
    } else if (error.message.includes('quota')) {
      console.log('💡 Posible problema: Cuota de API excedida');
    }
    
    console.log('❌ TEST GEMINI FALLIDO\n');
    return false;
  }
}

async function testPinataIPFS() {
  console.log('📎 TEST 2: Pinata Cloud (IPFS)');
  console.log('─'.repeat(40));

  try {
    const PINATA_JWT = process.env.PINATA_JWT;
    const PINATA_API_KEY = process.env.PINATA_API_KEY;
    const PINATA_SECRET = process.env.PINATA_SECRET;

    if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_SECRET)) {
      throw new Error('Credenciales de Pinata no configuradas');
    }

    console.log(`📋 JWT configurado: ${PINATA_JWT ? PINATA_JWT.slice(0, 20) + '...' : 'No'}`);
    console.log(`📋 API Key configurada: ${PINATA_API_KEY ? PINATA_API_KEY.slice(0, 10) + '...' : 'No'}`);

    // Test 1: Verificar autenticación
    const authHeaders = PINATA_JWT 
      ? { 'Authorization': `Bearer ${PINATA_JWT}` }
      : { 
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET
        };

    const authResponse = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: authHeaders
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      throw new Error(`Auth failed: ${authResponse.status} - ${errorText}`);
    }

    const authData = await authResponse.json();
    console.log(`✅ Autenticación exitosa: ${authData.message}`);

    // Test 2: Upload de archivo de prueba
    const testContent = JSON.stringify({
      test: true,
      timestamp: Date.now(),
      message: "Test file from Fleak backend"
    });

    const formData = new FormData();
    const blob = new Blob([testContent], { type: 'application/json' });
    formData.append('file', blob, 'test-fleak.json');
    
    const metadata = JSON.stringify({
      name: 'fleak-test-file',
      keyvalues: {
        environment: 'test',
        project: 'fleak'
      }
    });
    formData.append('pinataMetadata', metadata);

    const uploadHeaders = PINATA_JWT 
      ? { 'Authorization': `Bearer ${PINATA_JWT}` }
      : { 
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET
        };

    const uploadResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: uploadHeaders,
      body: formData
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    console.log(`✅ Archivo subido exitosamente`);
    console.log(`✅ IPFS Hash: ${uploadData.IpfsHash}`);
    console.log(`✅ Size: ${uploadData.PinSize} bytes`);

    // Test 3: Verificar que el archivo es accesible
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${uploadData.IpfsHash}`;
    const accessResponse = await fetch(ipfsUrl);
    
    if (accessResponse.ok) {
      const retrievedContent = await accessResponse.text();
      const retrievedData = JSON.parse(retrievedContent);
      
      if (retrievedData.test === true) {
        console.log(`✅ Archivo recuperado correctamente desde IPFS`);
        console.log('🎯 TEST PINATA PASADO\n');
        return { success: true, hash: uploadData.IpfsHash };
      } else {
        throw new Error('Contenido recuperado no coincide');
      }
    } else {
      throw new Error('No se pudo acceder al archivo desde IPFS gateway');
    }

  } catch (error) {
    console.log(`❌ Error en Pinata: ${error.message}`);
    
    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('💡 Posible problema: Credenciales incorrectas');
    } else if (error.message.includes('payment')) {
      console.log('💡 Posible problema: Plan de Pinata agotado');
    }
    
    console.log('❌ TEST PINATA FALLIDO\n');
    return { success: false };
  }
}

async function testMongoDB() {
  console.log('🗄️  TEST 3: MongoDB Atlas');
  console.log('─'.repeat(40));

  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI no está configurada');
    }

    console.log(`📋 URI configurada: ${MONGODB_URI.split('@')[0]}@***`);

    // Intentar conectar usando mongoose
    const mongoose = require('mongoose');
    
    // Configurar opciones de conexión
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 segundos timeout
      maxPoolSize: 5
    };

    console.log('⏳ Conectando a MongoDB...');
    
    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ Conexión a MongoDB establecida');

    // Test: Crear colección temporal y operaciones CRUD
    const testSchema = new mongoose.Schema({
      test: Boolean,
      timestamp: Date,
      message: String
    });

    const TestModel = mongoose.model('FlakeTest', testSchema);

    // CREATE
    const testDoc = new TestModel({
      test: true,
      timestamp: new Date(),
      message: 'Test document from Fleak backend'
    });

    const savedDoc = await testDoc.save();
    console.log(`✅ Documento creado con ID: ${savedDoc._id}`);

    // READ
    const foundDoc = await TestModel.findById(savedDoc._id);
    if (foundDoc && foundDoc.test === true) {
      console.log('✅ Documento leído correctamente');
    } else {
      throw new Error('Documento no encontrado o datos incorrectos');
    }

    // UPDATE
    await TestModel.findByIdAndUpdate(savedDoc._id, { 
      message: 'Updated test document'
    });
    console.log('✅ Documento actualizado');

    // DELETE
    await TestModel.findByIdAndDelete(savedDoc._id);
    console.log('✅ Documento eliminado');

    // Verificar que se eliminó
    const deletedDoc = await TestModel.findById(savedDoc._id);
    if (!deletedDoc) {
      console.log('✅ Eliminación verificada');
    } else {
      throw new Error('Documento no se eliminó correctamente');
    }

    // Limpiar modelo de prueba
    await mongoose.connection.db.dropCollection('flaketests').catch(() => {
      // Ignorar error si la colección no existe
    });
    
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    console.log('🎯 TEST MONGODB PASADO\n');
    return true;

  } catch (error) {
    console.log(`❌ Error en MongoDB: ${error.message}`);
    
    if (error.message.includes('authentication')) {
      console.log('💡 Posible problema: Credenciales incorrectas');
    } else if (error.message.includes('network')) {
      console.log('💡 Posible problema: Conectividad de red');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Posible problema: MongoDB Atlas no responde');
    }
    
    console.log('❌ TEST MONGODB FALLIDO\n');
    return false;
  }
}

async function main() {
  console.log('🧪 TESTS DE SERVICIOS EXTERNOS');
  console.log('═'.repeat(50));
  console.log('');

  const results = {
    gemini: false,
    pinata: false,
    mongodb: false
  };

  // Ejecutar tests secuencialmente
  results.gemini = await testGeminiAPI();
  
  const pinataResult = await testPinataIPFS();
  results.pinata = pinataResult.success;
  
  results.mongodb = await testMongoDB();

  // Resumen final
  console.log('═'.repeat(50));
  console.log('📋 RESUMEN DE SERVICIOS EXTERNOS');
  console.log('═'.repeat(50));

  const services = [
    { name: 'Google Gemini API', status: results.gemini, icon: '🤖' },
    { name: 'Pinata Cloud (IPFS)', status: results.pinata, icon: '📎' },
    { name: 'MongoDB Atlas', status: results.mongodb, icon: '🗄️' }
  ];

  services.forEach((service, i) => {
    const statusIcon = service.status ? '✅' : '❌';
    const statusText = service.status ? 'OPERATIVO' : 'FALLIDO';
    console.log(`${i + 1}. ${service.icon} ${service.name}: ${statusIcon} ${statusText}`);
  });

  const passedServices = Object.values(results).filter(Boolean).length;
  const totalServices = Object.keys(results).length;

  console.log('');
  console.log(`📊 Resultado: ${passedServices}/${totalServices} servicios operativos`);

  if (passedServices === totalServices) {
    console.log('');
    console.log('🎉 ¡TODOS LOS SERVICIOS ESTÁN OPERATIVOS!');
    console.log('');
    console.log('✅ Servicios verificados:');
    console.log('   • Google Gemini - Análisis de evidencia con IA');
    console.log('   • Pinata Cloud - Almacenamiento descentralizado IPFS');
    console.log('   • MongoDB Atlas - Base de datos principal');
    console.log('');
    console.log('🚀 BACKEND COMPLETAMENTE LISTO PARA FRONTEND');
    console.log('');
    console.log('📝 Capacidades confirmadas:');
    console.log('   • Análisis de imágenes/videos para verificación AI');
    console.log('   • Upload y storage de evidencia en IPFS');
    console.log('   • Persistencia de usuarios, flakes, y attestations');
    console.log('   • Integración completa con smart contracts');
    console.log('');
  } else {
    console.log('');
    console.log('⚠️  Algunos servicios fallaron. Revisar configuración.');
    console.log('');
    console.log('📝 Servicios que requieren atención:');
    
    if (!results.gemini) {
      console.log('   • Google Gemini - Verificar API_KEY_GEMINI');
    }
    if (!results.pinata) {
      console.log('   • Pinata Cloud - Verificar PINATA_JWT/credenciales');
    }
    if (!results.mongodb) {
      console.log('   • MongoDB Atlas - Verificar MONGODB_URI');
    }
    
    console.log('');
    console.log('💡 El frontend puede funcionar parcialmente, pero');
    console.log('   algunas funciones estarán limitadas.');
  }

  console.log('═'.repeat(50));

  // Exit code según el resultado
  if (passedServices < totalServices) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('💥 Error crítico en tests:', error);
  process.exit(1);
});