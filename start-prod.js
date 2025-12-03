import { spawn } from 'child_process';
import process from 'process';

console.log('🚀 Starting Mexican Wildlife Platform...');
console.log('📍 Using Next.js + Express production mode');

// In production (Render), PORT is assigned by the platform for Next.js
// Express runs on a fixed internal port (3001) since it's not exposed directly
const PORT = process.env.PORT || 3000;  // This is for Next.js (Render assigns this)
const EXPRESS_PORT = process.env.EXPRESS_PORT || 3001;  // Express runs on fixed internal port

console.log(`🔧 Environment:`);
console.log(`   - Next.js PORT: ${PORT}`);
console.log(`   - Express PORT: ${EXPRESS_PORT}`);
console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'production'}`);
console.log(`   - MongoDB: ${process.env.MONGODB_URI ? '✓ Configured' : '✗ Not configured'}`);
console.log(`   - API URL: ${process.env.NEXT_PUBLIC_EXPRESS_API_URL || '/api'}`);

// Start Express server first
console.log(`\n📦 Starting Express API server on port ${EXPRESS_PORT}...`);
const expressServer = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        EXPRESS_PORT,
        PORT: undefined  // Remove PORT from Express context to avoid confusion
    }
});

expressServer.on('error', (err) => {
    console.error('❌ Failed to start Express server:', err);
    process.exit(1);
});

// Log when Express starts
let expressReady = false;
expressServer.stdout?.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Express API server running')) {
        expressReady = true;
        console.log('✅ Express is ready!');
    }
});

expressServer.stderr?.on('data', (data) => {
    console.error('[Express]', data.toString());
});

// Wait longer for Express to start in production, then start Next.js
// In Render, MongoDB connection and startup can take several seconds
const STARTUP_DELAY = process.env.NODE_ENV === 'production' ? 5000 : 2000;
console.log(`⏳ Waiting ${STARTUP_DELAY}ms for Express to initialize...`);

setTimeout(() => {
    console.log(`\n🌐 Starting Next.js server on port ${PORT}...`);
    const nextServer = spawn('next', ['start', '-p', PORT.toString()], {
        stdio: 'inherit',
        env: {
            ...process.env,
            PORT
        }
    });

    nextServer.on('error', (err) => {
        console.error('❌ Failed to start Next.js server:', err);
        expressServer.kill();
        process.exit(1);
    });

    nextServer.on('exit', (code) => {
        console.log(`Next.js server exited with code ${code}`);
        expressServer.kill();
        process.exit(code);
    });

    // Handle shutdown
    process.on('SIGINT', () => {
        console.log('\n\n⏹️ Shutting down...');
        expressServer.kill();
        nextServer.kill();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n\n⏹️ Terminating...');
        expressServer.kill();
        nextServer.kill();
        process.exit(0);
    });
}, STARTUP_DELAY);

expressServer.on('exit', (code) => {
    console.log(`Express server exited with code ${code}`);
    process.exit(code);
});
