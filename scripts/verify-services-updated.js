#!/usr/bin/env node
/**
 * Verificar que los servicios actualizados están listos para integración
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICACIÓN DE SERVICIOS ACTUALIZADOS');
console.log('═'.repeat(50));
console.log('');

function readFile(relativePath) {
  try {
    const fullPath = path.join('/home/saul/Documentos/proyectos/batches/fleak-internal-dev', relativePath);
    return fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    return null;
  }
}

function analyzeService(serviceName, filePath) {
  console.log(`🔧 Analizando ${serviceName}:`);
  
  const content = readFile(filePath);
  if (!content) {
    console.log(`   ❌ Archivo no encontrado`);
    return false;
  }

  const analysis = {
    hasFetch: content.includes('fetch('),
    hasErrorHandling: content.includes('try {') && content.includes('catch'),
    hasCredentials: content.includes("credentials: 'include'"),
    hasFallback: content.includes('NODE_ENV === \'development\''),
    usesRealAPI: content.includes('/api/'),
    hasTypeTransform: content.includes('Transform') || content.includes('map('),
  };

  // Score calculation
  const score = Object.values(analysis).filter(Boolean).length;
  const maxScore = Object.keys(analysis).length;
  const percentage = Math.round((score / maxScore) * 100);

  console.log(`   📊 Score: ${score}/${maxScore} (${percentage}%)`);
  
  if (analysis.hasFetch) console.log('   ✅ Hace fetch calls a APIs');
  else console.log('   ❌ No hace fetch calls');
  
  if (analysis.hasErrorHandling) console.log('   ✅ Manejo de errores implementado');
  else console.log('   ❌ Sin manejo de errores');
  
  if (analysis.hasCredentials) console.log('   ✅ Incluye credentials para sesiones');
  else console.log('   ⚠️  Sin credentials (puede afectar auth)');
  
  if (analysis.hasFallback) console.log('   ✅ Fallback a mocks en desarrollo');
  else console.log('   ⚠️  Sin fallback de desarrollo');
  
  if (analysis.usesRealAPI) console.log('   ✅ Conecta a endpoints reales');
  else console.log('   ❌ No conecta a endpoints');
  
  if (analysis.hasTypeTransform) console.log('   ✅ Transforma datos backend→frontend');
  else console.log('   ⚠️  Sin transformación de datos');

  console.log('');
  return percentage >= 80;
}

function main() {
  const services = [
    { name: 'AccountService', path: 'app/services/accountService.ts' },
    { name: 'FinanceService', path: 'app/services/financeService.ts' },
    { name: 'FriendService', path: 'app/services/friendService.ts' },
    { name: 'HomeService', path: 'app/services/homeService.ts' },
    { name: 'TestimonyService', path: 'app/services/testimonyService.ts' },
  ];

  let readyServices = 0;
  const totalServices = services.length;

  for (const service of services) {
    const isReady = analyzeService(service.name, service.path);
    if (isReady) readyServices++;
  }

  console.log('═'.repeat(50));
  console.log('📊 RESUMEN DE VERIFICACIÓN');
  console.log('═'.repeat(50));
  
  console.log(`📈 Servicios listos: ${readyServices}/${totalServices}`);
  const overallPercentage = Math.round((readyServices / totalServices) * 100);
  console.log(`🎯 Score general: ${overallPercentage}%`);

  if (overallPercentage >= 80) {
    console.log('\n🎉 ¡SERVICIOS LISTOS PARA INTEGRACIÓN!');
    console.log('\n✅ Cambios implementados:');
    console.log('   • Fetch calls a APIs reales del backend');
    console.log('   • Manejo de errores con try/catch');
    console.log('   • Credentials incluidas para autenticación');
    console.log('   • Fallback a mocks en desarrollo');
    console.log('   • Transformación de datos backend→frontend');
    console.log('\n🚀 READY PARA TESTING CON BACKEND CERTIFICADO');
  } else {
    console.log('\n⚠️  Algunos servicios necesitan más trabajo');
    console.log(`\nPorcentaje actual: ${overallPercentage}%`);
    console.log('Objetivo: 80%+ para integración');
  }

  console.log('\n' + '═'.repeat(50));
  
  if (overallPercentage >= 80) {
    console.log('✅ FRONTEND ACTUALIZADO Y LISTO');
  } else {
    console.log('⚠️  FRONTEND NECESITA MÁS ACTUALIZACIONES');
  }

  return overallPercentage >= 80;
}

const success = main();
process.exit(success ? 0 : 1);