#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class MERNProjectTester {
    constructor(projectPath = process.cwd()) {
        this.projectPath = projectPath;
        this.results = {
            frontend: [],
            backend: [],
            database: [],
            overall: [],
            errors: [],
            warnings: [],
            score: 0
        };
        this.clientPath = path.join(projectPath, 'client');
        this.serverPath = path.join(projectPath, 'server');
    }

    // Utility methods
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            reset: '\x1b[0m'
        };
        console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    async fileExists(filePath) {
        try {
            await fs.promises.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async readFile(filePath) {
        try {
            return await fs.promises.readFile(filePath, 'utf8');
        } catch (error) {
            return null;
        }
    }

    async readPackageJson(dir) {
        const packagePath = path.join(dir, 'package.json');
        const content = await this.readFile(packagePath);
        return content ? JSON.parse(content) : null;
    }

    addResult(category, test, status, message, details = '') {
        this.results[category].push({
            test,
            status,
            message,
            details,
            timestamp: new Date().toISOString()
        });
        
        if (status === 'pass') this.results.score += 1;
        if (status === 'fail') this.results.errors.push(`${category}: ${message}`);
        if (status === 'warning') this.results.warnings.push(`${category}: ${message}`);
    }

    // Project Structure Tests
    async testProjectStructure() {
        this.log('🔍 Testing Project Structure...', 'info');

        // Check for main directories
        const requiredDirs = ['client', 'server'];
        for (const dir of requiredDirs) {
            const dirPath = path.join(this.projectPath, dir);
            if (await this.fileExists(dirPath)) {
                this.addResult('overall', 'Directory Structure', 'pass', `${dir} directory exists`);
            } else {
                this.addResult('overall', 'Directory Structure', 'fail', `${dir} directory missing`);
            }
        }

        // Check for essential files
        const essentialFiles = [
            { path: 'client/package.json', name: 'Client package.json' },
            { path: 'server/package.json', name: 'Server package.json' },
            { path: 'client/src/App.js', name: 'React App.js' },
            { path: 'server/server.js', name: 'Server entry point' },
            { path: '.gitignore', name: 'Git ignore file' },
            { path: 'README.md', name: 'README file' }
        ];

        for (const file of essentialFiles) {
            const filePath = path.join(this.projectPath, file.path);
            if (await this.fileExists(filePath)) {
                this.addResult('overall', 'Essential Files', 'pass', `${file.name} exists`);
            } else {
                this.addResult('overall', 'Essential Files', 'warning', `${file.name} missing`);
            }
        }
    }

    // Frontend Tests
    async testFrontend() {
        this.log('⚛️ Testing Frontend (React)...', 'info');

        if (!await this.fileExists(this.clientPath)) {
            this.addResult('frontend', 'Frontend Setup', 'fail', 'Client directory not found');
            return;
        }

        // Check package.json
        const clientPackage = await this.readPackageJson(this.clientPath);
        if (clientPackage) {
            this.addResult('frontend', 'Package Configuration', 'pass', 'Client package.json exists');
            
            // Check for React dependencies
            const deps = { ...clientPackage.dependencies, ...clientPackage.devDependencies };
            const requiredDeps = ['react', 'react-dom', 'react-scripts'];
            
            for (const dep of requiredDeps) {
                if (deps[dep]) {
                    this.addResult('frontend', 'Dependencies', 'pass', `${dep} dependency found`);
                } else {
                    this.addResult('frontend', 'Dependencies', 'fail', `${dep} dependency missing`);
                }
            }

            // Check scripts
            if (clientPackage.scripts && clientPackage.scripts.start) {
                this.addResult('frontend', 'Build Scripts', 'pass', 'Start script configured');
            } else {
                this.addResult('frontend', 'Build Scripts', 'fail', 'Start script missing');
            }
        } else {
            this.addResult('frontend', 'Package Configuration', 'fail', 'Client package.json not found');
        }

        // Check React components
        const srcPath = path.join(this.clientPath, 'src');
        if (await this.fileExists(srcPath)) {
            const components = ['App.js', 'index.js'];
            for (const comp of components) {
                const compPath = path.join(srcPath, comp);
                if (await this.fileExists(compPath)) {
                    this.addResult('frontend', 'React Components', 'pass', `${comp} exists`);
                } else {
                    this.addResult('frontend', 'React Components', 'fail', `${comp} missing`);
                }
            }
        }

        // Check for routing
        const routingFiles = ['routing', 'routes', 'Router'];
        let routingFound = false;
        for (const routeFile of routingFiles) {
            const routePath = path.join(this.clientPath, 'src', 'components', routeFile + '.js');
            if (await this.fileExists(routePath)) {
                routingFound = true;
                break;
            }
        }
        
        if (routingFound) {
            this.addResult('frontend', 'Routing', 'pass', 'Client-side routing configured');
        } else {
            this.addResult('frontend', 'Routing', 'warning', 'No explicit routing files found');
        }

        // Check for CSS/Styling
        const styleFiles = ['App.css', 'index.css', 'styles'];
        let stylingFound = false;
        for (const styleFile of styleFiles) {
            const stylePath = path.join(srcPath, styleFile);
            if (await this.fileExists(stylePath) || await this.fileExists(stylePath + '.css')) {
                stylingFound = true;
                break;
            }
        }
        
        if (stylingFound) {
            this.addResult('frontend', 'Styling', 'pass', 'CSS styling files found');
        } else {
            this.addResult('frontend', 'Styling', 'warning', 'No CSS files found');
        }

        // Test frontend build
        await this.testFrontendBuild();
    }

    async testFrontendBuild() {
        try {
            this.log('🔨 Testing Frontend Build...', 'info');
            const { stdout, stderr } = await execAsync('npm run build', { 
                cwd: this.clientPath,
                timeout: 60000 
            });
            
            if (stdout.includes('build') || !stderr) {
                this.addResult('frontend', 'Build Process', 'pass', 'Frontend builds successfully');
            } else {
                this.addResult('frontend', 'Build Process', 'fail', 'Build process failed', stderr);
            }
        } catch (error) {
            this.addResult('frontend', 'Build Process', 'fail', 'Build command failed', error.message);
        }
    }

    // Backend Tests
    async testBackend() {
        this.log('🌐 Testing Backend (Node.js/Express)...', 'info');

        if (!await this.fileExists(this.serverPath)) {
            this.addResult('backend', 'Backend Setup', 'fail', 'Server directory not found');
            return;
        }

        // Check package.json
        const serverPackage = await this.readPackageJson(this.serverPath);
        if (serverPackage) {
            this.addResult('backend', 'Package Configuration', 'pass', 'Server package.json exists');
            
            // Check for required dependencies
            const deps = { ...serverPackage.dependencies, ...serverPackage.devDependencies };
            const requiredDeps = ['express', 'mongoose', 'cors', 'dotenv'];
            
            for (const dep of requiredDeps) {
                if (deps[dep]) {
                    this.addResult('backend', 'Dependencies', 'pass', `${dep} dependency found`);
                } else {
                    this.addResult('backend', 'Dependencies', dep === 'mongoose' ? 'warning' : 'fail', 
                        `${dep} dependency missing`);
                }
            }
        }

        // Check server entry point
        const serverFiles = ['server.js', 'index.js', 'app.js'];
        let serverEntryFound = false;
        for (const file of serverFiles) {
            const serverFile = path.join(this.serverPath, file);
            if (await this.fileExists(serverFile)) {
                serverEntryFound = true;
                const content = await this.readFile(serverFile);
                
                // Check for Express setup
                if (content && content.includes('express')) {
                    this.addResult('backend', 'Express Setup', 'pass', `Express configured in ${file}`);
                }
                
                // Check for CORS
                if (content && content.includes('cors')) {
                    this.addResult('backend', 'CORS Configuration', 'pass', 'CORS middleware found');
                } else {
                    this.addResult('backend', 'CORS Configuration', 'warning', 'CORS not explicitly configured');
                }
                
                break;
            }
        }
        
        if (serverEntryFound) {
            this.addResult('backend', 'Server Entry', 'pass', 'Server entry point exists');
        } else {
            this.addResult('backend', 'Server Entry', 'fail', 'No server entry point found');
        }

        // Check for routes
        const routesPath = path.join(this.serverPath, 'routes');
        if (await this.fileExists(routesPath)) {
            this.addResult('backend', 'API Routes', 'pass', 'Routes directory exists');
            
            // Check specific route files
            const routeFiles = ['auth.js', 'blog.js', 'projects.js', 'contact.js'];
            for (const routeFile of routeFiles) {
                const routePath = path.join(routesPath, routeFile);
                if (await this.fileExists(routePath)) {
                    this.addResult('backend', 'API Endpoints', 'pass', `${routeFile} route exists`);
                }
            }
        } else {
            this.addResult('backend', 'API Routes', 'warning', 'Routes directory not found');
        }

        // Check for models
        const modelsPath = path.join(this.serverPath, 'models');
        if (await this.fileExists(modelsPath)) {
            this.addResult('backend', 'Database Models', 'pass', 'Models directory exists');
        } else {
            this.addResult('backend', 'Database Models', 'warning', 'Models directory not found');
        }

        // Check for middleware
        const middlewarePath = path.join(this.serverPath, 'middleware');
        if (await this.fileExists(middlewarePath)) {
            this.addResult('backend', 'Middleware', 'pass', 'Middleware directory exists');
        } else {
            this.addResult('backend', 'Middleware', 'warning', 'Middleware directory not found');
        }

        // Check environment configuration
        const envPath = path.join(this.serverPath, '.env');
        if (await this.fileExists(envPath)) {
            this.addResult('backend', 'Environment Config', 'pass', '.env file exists');
        } else {
            this.addResult('backend', 'Environment Config', 'warning', '.env file not found');
        }
    }

    // Database Tests
    async testDatabase() {
        this.log('🗄️ Testing Database Configuration...', 'info');

        // Check for MongoDB connection in server files
        const serverFiles = ['server.js', 'index.js', 'app.js', 'config/database.js'];
        let mongoConfigFound = false;
        
        for (const file of serverFiles) {
            const filePath = path.join(this.serverPath, file);
            const content = await this.readFile(filePath);
            
            if (content) {
                if (content.includes('mongoose.connect') || content.includes('MongoClient')) {
                    mongoConfigFound = true;
                    this.addResult('database', 'MongoDB Configuration', 'pass', 
                        `MongoDB connection found in ${file}`);
                    
                    // Check for connection error handling
                    if (content.includes('catch') || content.includes('.on(\'error')) {
                        this.addResult('database', 'Error Handling', 'pass', 
                            'Database error handling implemented');
                    } else {
                        this.addResult('database', 'Error Handling', 'warning', 
                            'No database error handling found');
                    }
                    break;
                }
            }
        }
        
        if (!mongoConfigFound) {
            this.addResult('database', 'MongoDB Configuration', 'fail', 
                'No MongoDB connection configuration found');
        }

        // Check for models
        const modelsPath = path.join(this.serverPath, 'models');
        if (await this.fileExists(modelsPath)) {
            try {
                const modelFiles = await fs.promises.readdir(modelsPath);
                const jsModels = modelFiles.filter(file => file.endsWith('.js'));
                
                if (jsModels.length > 0) {
                    this.addResult('database', 'Database Models', 'pass', 
                        `${jsModels.length} model files found`);
                    
                    // Check individual models
                    for (const model of jsModels) {
                        const modelPath = path.join(modelsPath, model);
                        const content = await this.readFile(modelPath);
                        
                        if (content && content.includes('Schema')) {
                            this.addResult('database', 'Model Schemas', 'pass', 
                                `${model} contains valid schema`);
                        }
                    }
                } else {
                    this.addResult('database', 'Database Models', 'warning', 
                        'No JavaScript model files found');
                }
            } catch (error) {
                this.addResult('database', 'Database Models', 'warning', 
                    'Could not read models directory');
            }
        }

        // Test MongoDB connection (if possible)
        await this.testMongoConnection();
    }

    async testMongoConnection() {
        try {
            // Try to connect to MongoDB if mongoose is available
            const mongoose = require('mongoose');
            const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
            
            await mongoose.connect(connectionString, { 
                useNewUrlParser: true, 
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000
            });
            
            this.addResult('database', 'MongoDB Connection', 'pass', 
                'Successfully connected to MongoDB');
            
            await mongoose.disconnect();
        } catch (error) {
            this.addResult('database', 'MongoDB Connection', 'warning', 
                'Could not test MongoDB connection', error.message);
        }
    }

    // Security Tests
    async testSecurity() {
        this.log('🔒 Testing Security Configuration...', 'info');

        // Check for environment variables
        const envPath = path.join(this.serverPath, '.env');
        const envContent = await this.readFile(envPath);
        
        if (envContent) {
            // Check for sensitive data in .env
            const sensitiveKeys = ['JWT_SECRET', 'DB_PASSWORD', 'API_KEY', 'SECRET'];
            let secretsFound = 0;
            
            sensitiveKeys.forEach(key => {
                if (envContent.includes(key)) {
                    secretsFound++;
                }
            });
            
            if (secretsFound > 0) {
                this.addResult('overall', 'Security', 'pass', 
                    `${secretsFound} environment secrets configured`);
            } else {
                this.addResult('overall', 'Security', 'warning', 
                    'No sensitive environment variables found');
            }
        }

        // Check .gitignore
        const gitignorePath = path.join(this.projectPath, '.gitignore');
        const gitignoreContent = await this.readFile(gitignorePath);
        
        if (gitignoreContent) {
            const securityIgnores = ['.env', 'node_modules', '*.log'];
            let ignoresFound = 0;
            
            securityIgnores.forEach(ignore => {
                if (gitignoreContent.includes(ignore)) {
                    ignoresFound++;
                }
            });
            
            if (ignoresFound >= 2) {
                this.addResult('overall', 'Security', 'pass', 
                    'Sensitive files properly ignored in git');
            } else {
                this.addResult('overall', 'Security', 'warning', 
                    'Gitignore may not protect sensitive files');
            }
        }
    }

    // Performance Tests
    async testPerformance() {
        this.log('⚡ Testing Performance Optimizations...', 'info');

        // Check for production optimizations in client
        const clientPackage = await this.readPackageJson(this.clientPath);
        if (clientPackage && clientPackage.scripts && clientPackage.scripts.build) {
            this.addResult('overall', 'Performance', 'pass', 
                'Production build script configured');
        }

        // Check for compression middleware
        const serverPackage = await this.readPackageJson(this.serverPath);
        if (serverPackage) {
            const deps = { ...serverPackage.dependencies, ...serverPackage.devDependencies };
            if (deps.compression) {
                this.addResult('overall', 'Performance', 'pass', 
                    'Compression middleware available');
            } else {
                this.addResult('overall', 'Performance', 'warning', 
                    'No compression middleware found');
            }
        }
    }

    // Generate Report
    generateReport() {
        const totalTests = Object.values(this.results)
            .filter(arr => Array.isArray(arr))
            .flat().length;
            
        const passedTests = Object.values(this.results)
            .filter(arr => Array.isArray(arr))
            .flat()
            .filter(test => test.status === 'pass').length;
            
        const failedTests = Object.values(this.results)
            .filter(arr => Array.isArray(arr))
            .flat()
            .filter(test => test.status === 'fail').length;
            
        const warningTests = Object.values(this.results)
            .filter(arr => Array.isArray(arr))
            .flat()
            .filter(test => test.status === 'warning').length;

        const score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

        console.log('\n' + '='.repeat(60));
        console.log('🎯 MERN PROJECT TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`📊 Overall Score: ${score}%`);
        console.log(`✅ Passed: ${passedTests}`);
        console.log(`❌ Failed: ${failedTests}`);
        console.log(`⚠️  Warnings: ${warningTests}`);
        console.log(`📋 Total Tests: ${totalTests}`);
        console.log('='.repeat(60));

        // Detailed results by category
        ['frontend', 'backend', 'database', 'overall'].forEach(category => {
            if (this.results[category].length > 0) {
                console.log(`\n📂 ${category.toUpperCase()} RESULTS:`);
                this.results[category].forEach(result => {
                    const icon = result.status === 'pass' ? '✅' : 
                               result.status === 'fail' ? '❌' : '⚠️';
                    console.log(`  ${icon} ${result.message}`);
                    if (result.details) {
                        console.log(`     Details: ${result.details}`);
                    }
                });
            }
        });

        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        if (score >= 80) {
            console.log('🎉 Excellent! Your MERN application is in great shape!');
        } else if (score >= 60) {
            console.log('👍 Good progress! Address the failed tests to improve.');
        } else {
            console.log('🔧 Your application needs attention. Focus on failed tests first.');
        }

        if (this.results.errors.length > 0) {
            console.log('\n🚨 CRITICAL ISSUES TO FIX:');
            this.results.errors.forEach(error => console.log(`  • ${error}`));
        }

        if (this.results.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS TO CONSIDER:');
            this.results.warnings.forEach(warning => console.log(`  • ${warning}`));
        }

        console.log('\n' + '='.repeat(60));
    }

    // Main test runner
    async runAllTests() {
        console.log('🚀 Starting MERN Project Automated Testing...\n');
        
        try {
            await this.testProjectStructure();
            await this.testFrontend();
            await this.testBackend();
            await this.testDatabase();
            await this.testSecurity();
            await this.testPerformance();
            
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Testing failed:', error.message);
            process.exit(1);
        }
    }
}

// CLI Usage
if (require.main === module) {
    const projectPath = process.argv[2] || process.cwd();
    const tester = new MERNProjectTester(projectPath);
    tester.runAllTests();
}

module.exports = MERNProjectTester;