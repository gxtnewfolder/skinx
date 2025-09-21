"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
exports.withDatabaseErrorHandling = withDatabaseErrorHandling;
exports.withTransaction = withTransaction;
exports.withTimeout = withTimeout;
exports.setupGracefulShutdown = setupGracefulShutdown;
const prisma_1 = require("../../generated/prisma");
const errorHandler_1 = require("./errorHandler");
// Database connection wrapper with error handling
class DatabaseService {
    static instance;
    static connectionAttempts = 0;
    static maxRetries = 3;
    static retryDelay = 1000; // 1 second
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new prisma_1.PrismaClient({
                log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
                errorFormat: 'pretty',
            });
        }
        return DatabaseService.instance;
    }
    static async connect() {
        const prisma = DatabaseService.getInstance();
        while (DatabaseService.connectionAttempts < DatabaseService.maxRetries) {
            try {
                await prisma.$connect();
                console.log('Database connected successfully');
                DatabaseService.connectionAttempts = 0; // Reset on successful connection
                return;
            }
            catch (error) {
                DatabaseService.connectionAttempts++;
                console.error(`Database connection attempt ${DatabaseService.connectionAttempts} failed:`, error);
                if (DatabaseService.connectionAttempts >= DatabaseService.maxRetries) {
                    throw new errorHandler_1.AppError(503, "Service Unavailable", "Unable to connect to database after multiple attempts");
                }
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, DatabaseService.retryDelay));
                DatabaseService.retryDelay *= 2; // Exponential backoff
            }
        }
    }
    static async disconnect() {
        if (DatabaseService.instance) {
            await DatabaseService.instance.$disconnect();
            console.log('Database disconnected');
        }
    }
    static async healthCheck() {
        try {
            const prisma = DatabaseService.getInstance();
            await prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            console.error('Database health check failed:', error);
            return false;
        }
    }
}
exports.DatabaseService = DatabaseService;
// Database operation wrapper with error handling
async function withDatabaseErrorHandling(operation, context) {
    try {
        return await operation();
    }
    catch (error) {
        console.error(`Database operation failed${context ? ` (${context})` : ''}:`, error);
        // Re-throw the error to be handled by the global error handler
        throw error;
    }
}
// Transaction wrapper with error handling
async function withTransaction(operations, context) {
    const prisma = DatabaseService.getInstance();
    try {
        return await prisma.$transaction(async (tx) => {
            return await operations(tx);
        });
    }
    catch (error) {
        console.error(`Transaction failed${context ? ` (${context})` : ''}:`, error);
        throw error;
    }
}
// Database query timeout wrapper
async function withTimeout(operation, timeoutMs = 30000, // 30 seconds default
context) {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new errorHandler_1.AppError(408, "Request Timeout", `Database operation timed out${context ? ` (${context})` : ''}`));
        }, timeoutMs);
    });
    return Promise.race([operation, timeoutPromise]);
}
// Graceful shutdown handler
function setupGracefulShutdown() {
    const gracefulShutdown = async (signal) => {
        console.log(`Received ${signal}. Starting graceful shutdown...`);
        try {
            await DatabaseService.disconnect();
            console.log('Graceful shutdown completed');
            process.exit(0);
        }
        catch (error) {
            console.error('Error during graceful shutdown:', error);
            process.exit(1);
        }
    };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon
}
//# sourceMappingURL=databaseErrorHandler.js.map