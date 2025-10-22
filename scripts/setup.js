const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando projeto...\n');

// Verificar Node.js
try {
  const nodeVersion = execSync('node --version').toString().trim();
  console.log('✅ Node.js instalado:', nodeVersion);
} catch (error) {
  console.error('❌ Node.js não encontrado. Por favor, instale o Node.js 18+');
  process.exit(1);
}

// Instalar dependências
console.log('\n📦 Instalando dependências...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependências instaladas');
} catch (error) {
  console.error('❌ Erro ao instalar dependências');
  process.exit(1);
}

// Instalar Playwright
console.log('\n🎭 Instalando Playwright...');
try {
  execSync('npx playwright install chromium', { stdio: 'inherit' });
  console.log('✅ Playwright instalado');
} catch (error) {
  console.error('❌ Erro ao instalar Playwright');
  process.exit(1);
}

// Criar planilha de exemplo
console.log('\n📊 Criando planilha de exemplo...');
try {
  execSync('node scripts/create-example-excel.js', { stdio: 'inherit' });
} catch (error) {
  console.error('⚠️  Erro ao criar planilha de exemplo (não crítico)');
}

// Criar arquivo .env se não existir
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ Arquivo .env criado');
}

console.log('\n✨ Configuração completa!\n');
console.log('Para iniciar o aplicativo, execute:');
console.log('  npm run electron-dev\n');

