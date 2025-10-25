#!/usr/bin/env node
/**
 * Análisis completo del Frontend de Fleak
 * Verificar readiness para integración con backend
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 ANÁLISIS COMPLETO DEL FRONTEND - FLEAK');
console.log('═'.repeat(50));
console.log('');

// Helper para leer archivos
function readFile(relativePath) {
  try {
    const fullPath = path.join('/home/saul/Documentos/proyectos/batches/fleak-internal-dev', relativePath);
    return fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Helper para verificar si un archivo existe
function fileExists(relativePath) {
  try {
    const fullPath = path.join('/home/saul/Documentos/proyectos/batches/fleak-internal-dev', relativePath);
    return fs.existsSync(fullPath);
  } catch (error) {
    return false;
  }
}

// Helper para listar archivos en directorio
function listDir(relativePath) {
  try {
    const fullPath = path.join('/home/saul/Documentos/proyectos/batches/fleak-internal-dev', relativePath);
    return fs.readdirSync(fullPath);
  } catch (error) {
    return [];
  }
}

async function analyzeArchitecture() {
  console.log('🏗️  ANÁLISIS 1: ARQUITECTURA Y ESTRUCTURA');
  console.log('─'.repeat(40));

  const analysis = {
    packageJson: false,
    layout: false,
    providers: false,
    config: false,
    features: 0,
    services: 0,
    controllers: 0,
    types: 0,
    apiRoutes: 0
  };

  // Package.json
  const packageContent = readFile('package.json');
  if (packageContent) {
    const pkg = JSON.parse(packageContent);
    analysis.packageJson = true;
    
    console.log(`✅ package.json configurado`);
    console.log(`   • Next.js: ${pkg.dependencies.next}`);
    console.log(`   • MiniKit: ${pkg.dependencies['@coinbase/onchainkit']}`);
    console.log(`   • Material UI: ${pkg.dependencies['@mui/material']}`);
    console.log(`   • React Query: ${pkg.dependencies['@tanstack/react-query']}`);
    console.log(`   • Viem: ${pkg.dependencies.viem}`);
  }

  // Layout y providers
  analysis.layout = fileExists('app/layout.tsx');
  analysis.providers = fileExists('app/rootProvider.tsx');
  analysis.config = fileExists('minikit.config.ts');

  if (analysis.layout) console.log('✅ Layout principal configurado');
  if (analysis.providers) console.log('✅ Providers (OnchainKit, MUI) configurados');
  if (analysis.config) console.log('✅ MiniKit config establecido');

  // Features
  const features = listDir('app/features');
  analysis.features = features.length;
  console.log(`✅ Features implementadas: ${features.join(', ')}`);

  // Services
  const services = listDir('app/services');
  analysis.services = services.length;
  console.log(`✅ Services: ${services.length} archivos`);

  // Controllers
  const controllers = listDir('app/controllers');
  analysis.controllers = controllers.length;
  console.log(`✅ Controllers: ${controllers.length} archivos`);

  // Types
  const types = listDir('app/types');
  analysis.types = types.length;
  console.log(`✅ Types definidos: ${types.length} archivos`);

  // API Routes
  const apiDirs = listDir('app/api');
  analysis.apiRoutes = apiDirs.length;
  console.log(`✅ API Routes: ${apiDirs.length} endpoints`);

  console.log('');
  return analysis;
}

async function analyzeServices() {
  console.log('🔧 ANÁLISIS 2: SERVICIOS Y DATA LAYER');
  console.log('─'.repeat(40));

  const services = [
    'accountService.ts',
    'financeService.ts',
    'friendService.ts', 
    'homeService.ts',
    'testimonyService.ts'
  ];

  const analysis = {
    total: services.length,
    implemented: 0,
    usingMocks: 0,
    readyForAPI: 0
  };

  for (const service of services) {
    const content = readFile(`app/services/${service}`);
    if (content) {
      analysis.implemented++;
      
      // Verificar si usa mocks
      if (content.includes('Mock') || content.includes('mock')) {
        analysis.usingMocks++;
        console.log(`⚠️  ${service}: Usando mocks (necesita conectar API)`);
      } else if (content.includes('fetch') || content.includes('/api/')) {
        analysis.readyForAPI++;
        console.log(`✅ ${service}: Listo para API`);
      } else {
        console.log(`⚠️  ${service}: Estado desconocido`);
      }
    } else {
      console.log(`❌ ${service}: No encontrado`);
    }
  }

  console.log(`\n📊 Servicios: ${analysis.implemented}/${analysis.total} implementados`);
  console.log(`📊 Usando mocks: ${analysis.usingMocks}`);
  console.log(`📊 Listos para API: ${analysis.readyForAPI}`);
  console.log('');

  return analysis;
}

async function analyzeAuthentication() {
  console.log('🔐 ANÁLISIS 3: AUTENTICACIÓN Y MINIKIT');
  console.log('─'.repeat(40));

  const analysis = {
    onboardingGate: false,
    onboardingFlow: false,
    authAPI: false,
    usesAuthenticate: false,
    usesMiniKit: false,
    sessionHandling: false
  };

  // Onboarding components
  analysis.onboardingGate = fileExists('app/components/onboarding/OnboardingGate.tsx');
  analysis.onboardingFlow = fileExists('app/components/onboarding/OnboardingFlow.tsx');

  if (analysis.onboardingGate) console.log('✅ OnboardingGate implementado');
  if (analysis.onboardingFlow) console.log('✅ OnboardingFlow implementado');

  // Auth API
  analysis.authAPI = fileExists('app/api/auth/route.ts');
  if (analysis.authAPI) {
    console.log('✅ API de autenticación implementada');
    
    const authContent = readFile('app/api/auth/route.ts');
    if (authContent && authContent.includes('@farcaster/quick-auth')) {
      console.log('✅ Integración Farcaster Quick Auth configurada');
    }
  }

  // Verificar uso de hooks de MiniKit
  const onboardingContent = readFile('app/components/onboarding/OnboardingFlow.tsx');
  if (onboardingContent) {
    analysis.usesAuthenticate = onboardingContent.includes('useAuthenticate');
    analysis.usesMiniKit = onboardingContent.includes('useMiniKit');
    
    if (analysis.usesAuthenticate) console.log('✅ useAuthenticate hook implementado');
    if (analysis.usesMiniKit) console.log('✅ useMiniKit hook implementado');
  }

  // Session handling
  analysis.sessionHandling = fileExists('lib/auth/session.ts');
  if (analysis.sessionHandling) {
    console.log('✅ Manejo de sesiones implementado');
  }

  const authScore = Object.values(analysis).filter(Boolean).length;
  console.log(`\n📊 Score autenticación: ${authScore}/6`);
  console.log('');

  return analysis;
}

async function analyzeIntegrationReadiness() {
  console.log('🔄 ANÁLISIS 4: READINESS PARA INTEGRACIÓN');
  console.log('─'.repeat(40));

  const issues = [];
  const recommendations = [];

  // Verificar servicios con mocks
  const serviceFiles = ['accountService.ts', 'financeService.ts', 'friendService.ts', 'homeService.ts', 'testimonyService.ts'];
  
  for (const service of serviceFiles) {
    const content = readFile(`app/services/${service}`);
    if (content && content.includes('Mock')) {
      issues.push(`${service} usa mocks - necesita conectar API`);
      recommendations.push(`Actualizar ${service} para hacer fetch a /api/`);
    }
  }

  // Verificar correspondencia con backend APIs
  const expectedAPIs = [
    'app/api/account/summary',
    'app/api/finance/summary', 
    'app/api/friends/overview',
    'app/api/auth/login'
  ];

  for (const apiPath of expectedAPIs) {
    if (!fileExists(`${apiPath}/route.ts`)) {
      issues.push(`${apiPath} no encontrado`);
    } else {
      console.log(`✅ ${apiPath} implementado`);
    }
  }

  // Verificar tipos compatibles
  const frontendTypes = readFile('app/types/finance.ts');
  const backendService = readFile('lib/server/financeService.ts');
  
  if (frontendTypes && backendService) {
    // Verificar si los tipos coinciden aproximadamente
    const frontendHasBalance = frontendTypes.includes('FinanceBalance');
    const frontendHasActivity = frontendTypes.includes('FinanceActivity');
    const backendHasSnapshot = backendService.includes('FinanceSnapshot');
    
    if (frontendHasBalance && frontendHasActivity && backendHasSnapshot) {
      console.log('✅ Tipos frontend/backend compatibles');
    } else {
      issues.push('Posible desalignment entre tipos frontend/backend');
      recommendations.push('Verificar compatibilidad de interfaces de datos');
    }
  }

  console.log('\n⚠️  ISSUES ENCONTRADOS:');
  issues.forEach(issue => console.log(`   • ${issue}`));

  console.log('\n💡 RECOMENDACIONES:');
  recommendations.forEach(rec => console.log(`   • ${rec}`));

  console.log('');
  return { issues, recommendations };
}

async function analyzeComponents() {
  console.log('🧩 ANÁLISIS 5: COMPONENTES UI');
  console.log('─'.repeat(40));

  const componentDirs = [
    'app/components/cards',
    'app/components/modals', 
    'app/components/navigation',
    'app/components/onboarding'
  ];

  const analysis = {
    totalComponents: 0,
    implementedComponents: 0
  };

  for (const dir of componentDirs) {
    const components = listDir(dir);
    const tsxComponents = components.filter(c => c.endsWith('.tsx'));
    
    analysis.totalComponents += tsxComponents.length;
    analysis.implementedComponents += tsxComponents.length;
    
    console.log(`✅ ${dir}: ${tsxComponents.length} componentes`);
    tsxComponents.forEach(comp => console.log(`   • ${comp}`));
  }

  console.log(`\n📊 Total componentes: ${analysis.totalComponents}`);
  console.log('');

  return analysis;
}

async function generateReport() {
  console.log('📋 GENERANDO REPORTE FINAL');
  console.log('─'.repeat(40));

  const architectureData = await analyzeArchitecture();
  const servicesData = await analyzeServices();
  const authData = await analyzeAuthentication();
  const componentsData = await analyzeComponents();
  const integrationData = await analyzeIntegrationReadiness();

  // Calcular scores
  const architectureScore = (
    (architectureData.packageJson ? 1 : 0) +
    (architectureData.layout ? 1 : 0) +
    (architectureData.providers ? 1 : 0) +
    (architectureData.config ? 1 : 0) +
    (architectureData.features >= 5 ? 1 : 0) +
    (architectureData.services >= 5 ? 1 : 0) +
    (architectureData.controllers >= 5 ? 1 : 0) +
    (architectureData.types >= 5 ? 1 : 0) +
    (architectureData.apiRoutes >= 6 ? 1 : 0)
  ) / 9;

  const servicesScore = servicesData.implemented / servicesData.total;
  const authScore = Object.values(authData).filter(Boolean).length / 6;
  const issuesPenalty = Math.min(integrationData.issues.length * 0.1, 0.5);
  
  const overallScore = ((architectureScore + servicesScore + authScore) / 3) - issuesPenalty;

  console.log('═'.repeat(50));
  console.log('📊 REPORTE FINAL - FRONTEND READINESS');
  console.log('═'.repeat(50));

  console.log('\n📈 SCORES POR CATEGORÍA:');
  console.log(`   • Arquitectura: ${Math.round(architectureScore * 100)}%`);
  console.log(`   • Servicios: ${Math.round(servicesScore * 100)}%`);
  console.log(`   • Autenticación: ${Math.round(authScore * 100)}%`);
  console.log(`   • Issues: -${Math.round(issuesPenalty * 100)}%`);

  console.log(`\n🎯 SCORE GENERAL: ${Math.round(overallScore * 100)}%`);

  // Status based on score
  if (overallScore >= 0.9) {
    console.log('\n🎉 STATUS: EXCELENTE - LISTO PARA INTEGRACIÓN');
    console.log('✅ El frontend está prácticamente listo para conectar con el backend');
  } else if (overallScore >= 0.7) {
    console.log('\n✅ STATUS: BUENO - NECESITA AJUSTES MENORES');
    console.log('⚠️  Algunos ajustes necesarios antes de integración completa');
  } else if (overallScore >= 0.5) {
    console.log('\n⚠️  STATUS: REGULAR - NECESITA TRABAJO');
    console.log('🔧 Varios componentes necesitan trabajo antes de integración');
  } else {
    console.log('\n❌ STATUS: NECESITA DESARROLLO SIGNIFICATIVO');
    console.log('🚧 El frontend requiere desarrollo adicional');
  }

  // Próximos pasos
  console.log('\n🚀 PRÓXIMOS PASOS RECOMENDADOS:');
  
  if (servicesData.usingMocks > 0) {
    console.log('1. 🔧 ACTUALIZAR SERVICIOS: Conectar servicios con APIs reales');
    console.log('   • Reemplazar mocks con fetch calls a /api/ endpoints');
    console.log('   • Implementar error handling y loading states');
  }

  if (integrationData.issues.length > 0) {
    console.log('2. 🔄 RESOLVER ISSUES: Corregir problemas identificados');
    integrationData.recommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`   • ${rec}`);
    });
  }

  console.log('3. 🧪 TESTING: Probar integración con backend certificado');
  console.log('   • Verificar flujos end-to-end');
  console.log('   • Testear autenticación MiniKit');
  console.log('   • Validar data binding');

  console.log('4. 🎯 DEPLOYMENT: Preparar para producción');
  console.log('   • Environment variables configuradas');
  console.log('   • Build process optimizado');
  console.log('   • Error boundaries implementados');

  console.log('\n═'.repeat(50));

  return {
    overallScore,
    architectureScore,
    servicesScore,
    authScore,
    issuesPenalty,
    ready: overallScore >= 0.7
  };
}

async function main() {
  const report = await generateReport();
  
  if (report.ready) {
    console.log('✅ FRONTEND READY PARA INTEGRACIÓN CON BACKEND');
    process.exit(0);
  } else {
    console.log('⚠️  FRONTEND NECESITA TRABAJO ANTES DE INTEGRACIÓN');
    process.exit(1);
  }
}

main().catch(console.error);