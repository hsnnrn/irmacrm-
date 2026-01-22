const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment to Hostinger...\n');

// Build the project
console.log('📦 Building Next.js application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed!\n');
} catch (error) {
  console.error('❌ Build failed!');
  process.exit(1);
}

// Check if .env.production exists
const envPath = path.join(process.cwd(), '.env.production');
if (!fs.existsSync(envPath)) {
  console.warn('⚠️  Warning: .env.production not found!');
  console.warn('   Please create .env.production file before deploying.\n');
}

console.log('📤 Ready to upload!');
console.log('\nNext steps:');
console.log('1. Upload files to server using SCP or FTP');
console.log('2. SSH to server and run: npm install --production');
console.log('3. Start with PM2: pm2 start npm --name "crm" -- start');
console.log('\nSee DEPLOYMENT.md for detailed instructions.');
