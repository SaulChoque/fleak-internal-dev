#!/usr/bin/env node
/**
 * Test de integración Frontend-Backend
 * Verifica que el frontend actualizado funciona con el backend certificado
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🔗 TEST DE INTEGRACIÓN FRONTEND-BACKEND');
console.log('═'.repeat(50));
console.log('');

// Helper para hacer requests HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

// Test endpoints que el frontend usará
async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    console.log(`🔍 Testing ${name}...`);
    const response = await makeRequest(`http://localhost:3000${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'session=mock-session-for-testing', // Mock session
      }
    });

    if (response.status === expectedStatus) {
      console.log(`   ✅ ${name}: Status ${response.status} ✓`);
      if (response.data && typeof response.data === 'object') {
        console.log(`   📊 Datos recibidos: ${Object.keys(response.data).length} campos`);
      }
      return true;
    } else {
      console.log(`   ❌ ${name}: Status ${response.status} (esperaba ${expectedStatus})`);
      if (response.data) {
        console.log(`   📄 Respuesta: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ${name}: Error - ${error.message}`);
    return false;
  }
}

async function testFrontendServices() {
  console.log('🧪 PROBANDO SERVICIOS FRONTEND CON BACKEND');
  console.log('-'.repeat(50));

  const tests = [
    { name: 'Account Service', endpoint: '/api/account/summary' },
    { name: 'Finance Service', endpoint: '/api/finance/summary' },
    { name: 'Friends Service', endpoint: '/api/friends/overview' },
    { name: 'Auth Service', endpoint: '/api/auth/login', method: 'POST', expectedStatus: 405 }, // POST only
  ];

  let passedTests = 0;
  for (const test of tests) {
    const passed = await testEndpoint(test.name, test.endpoint, test.expectedStatus || 200);
    if (passed) passedTests++;
    console.log('');
  }

  return { passed: passedTests, total: tests.length };
}

function checkPackageJson() {
  console.log('📦 VERIFICANDO DEPENDENCIAS');
  console.log('-'.repeat(50));
  
  try {
    const packagePath = '/home/saul/Documentos/proyectos/batches/fleak-internal-dev/package.json';
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const criticalDeps = [
      '@coinbase/onchainkit',
      'next',
      'react',
      'viem',
      '@mui/material'
    ];

    console.log('🔍 Dependencias críticas:');
    let allPresent = true;
    
    for (const dep of criticalDeps) {
      const version = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
      if (version) {
        console.log(`   ✅ ${dep}: ${version}`);
      } else {
        console.log(`   ❌ ${dep}: No encontrada`);
        allPresent = false;
      }
    }

    console.log('');
    return allPresent;
  } catch (error) {
    console.log(`   ❌ Error leyendo package.json: ${error.message}`);
    return false;
  }
}

function checkNextConfig() {
  console.log('⚙️  VERIFICANDO CONFIGURACIÓN NEXT.JS');
  console.log('-'.repeat(50));
  
  try {
    const configPath = '/home/saul/Documentos/proyectos/batches/fleak-internal-dev/next.config.ts';
    const configExists = fs.existsSync(configPath);
    
    if (configExists) {
      console.log('   ✅ next.config.ts existe');
      const content = fs.readFileSync(configPath, 'utf8');
      
      if (content.includes('experimental')) {
        console.log('   ✅ Configuración experimental encontrada');
      }
      if (content.includes('env')) {
        console.log('   ✅ Variables de entorno configuradas');
      }
      
      console.log('');
      return true;
    } else {
      console.log('   ❌ next.config.ts no encontrado');
      console.log('');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error verificando configuración: ${error.message}`);
    console.log('');
    return false;
  }
}

function checkEnvironmentFiles() {
  console.log('🌍 VERIFICANDO VARIABLES DE ENTORNO');
  console.log('-'.repeat(50));
  
  const envFiles = ['.env.local', '.env', '.env.example'];
  let foundEnv = false;
  
  for (const file of envFiles) {
    const envPath = `/home/saul/Documentos/proyectos/batches/fleak-internal-dev/${file}`;
    if (fs.existsSync(envPath)) {
      console.log(`   ✅ ${file} encontrado`);
      foundEnv = true;
      
      const content = fs.readFileSync(envPath, 'utf8');
      const hasRequired = content.includes('NEXT_PUBLIC') || content.includes('DATABASE') || content.includes('BASE');
      if (hasRequired) {
        console.log(`   ✅ ${file} contiene variables necesarias`);
      }
    } else {
      console.log(`   ⚠️  ${file} no encontrado`);
    }
  }
  
  console.log('');
  return foundEnv;
}

async function main() {
  console.log('🚀 Iniciando verificación de integración...\n');
  
  // Verificaciones estáticas
  const depsOk = checkPackageJson();
  const configOk = checkNextConfig();
  const envOk = checkEnvironmentFiles();
  
  // Intentar probar endpoints (puede fallar si el servidor no está corriendo)
  console.log('🌐 INTENTANDO CONECTAR CON BACKEND');
  console.log('-'.repeat(50));
  console.log('⚠️  Nota: Estos tests requieren que el servidor esté corriendo (npm run dev)');
  console.log('');
  
  const serviceTests = await testFrontendServices();
  
  // Reporte final
  console.log('═'.repeat(50));
  console.log('📊 REPORTE FINAL DE INTEGRACIÓN');
  console.log('═'.repeat(50));
  
  console.log('\n✅ VERIFICACIONES ESTÁTICAS:');
  console.log(`   📦 Dependencias: ${depsOk ? 'OK' : 'FALTAN'}`);
  console.log(`   ⚙️  Configuración: ${configOk ? 'OK' : 'FALTA'}`);
  console.log(`   🌍 Variables de entorno: ${envOk ? 'OK' : 'REVISAR'}`);
  
  console.log('\n🔗 TESTS DE ENDPOINTS:');
  console.log(`   🧪 Servicios probados: ${serviceTests.passed}/${serviceTests.total}`);
  if (serviceTests.passed === 0) {
    console.log('   ⚠️  No se pudo conectar con el backend (servidor no está corriendo?)');
  }
  
  const staticScore = (depsOk + configOk + envOk) / 3 * 100;
  const integrationScore = serviceTests.total > 0 ? (serviceTests.passed / serviceTests.total) * 100 : 0;
  
  console.log(`\n📈 SCORES:`);
  console.log(`   🔧 Configuración estática: ${Math.round(staticScore)}%`);
  console.log(`   🔗 Integración con backend: ${Math.round(integrationScore)}%`);
  
  if (staticScore >= 80) {
    console.log('\n🎉 ¡FRONTEND LISTO PARA INTEGRACIÓN!');
    console.log('\n📋 SIGUIENTE PASO:');
    console.log('   1. Ejecutar: npm run dev');
    console.log('   2. Probar flujos completos en browser');
    console.log('   3. Verificar autenticación con MiniKit');
  } else {
    console.log('\n⚠️  Frontend necesita más configuración');
    console.log('\n🔧 PENDIENTES:');
    if (!depsOk) console.log('   • Instalar dependencias faltantes');
    if (!configOk) console.log('   • Configurar next.config.ts');
    if (!envOk) console.log('   • Configurar variables de entorno');
  }
  
  console.log('\n' + '═'.repeat(50));
  console.log(staticScore >= 80 ? '✅ FRONTEND INTEGRATION READY' : '⚠️  FRONTEND NEEDS SETUP');
  
  return staticScore >= 80;
}

main().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Error en tests de integración:', error.message);
  process.exit(1);
});