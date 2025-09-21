import { PrismaClient } from "../../generated/prisma";
export declare class DatabaseService {
    private static instance;
    private static connectionAttempts;
    private static maxRetries;
    private static retryDelay;
    static getInstance(): PrismaClient;
    static connect(): Promise<void>;
    static disconnect(): Promise<void>;
    static healthCheck(): Promise<boolean>;
}
export declare function withDatabaseErrorHandling<T>(operation: () => Promise<T>, context?: string): Promise<T>;
export declare function withTransaction<T>(operations: (prisma: PrismaClient) => Promise<T>, context?: string): Promise<T>;
export declare function withTimeout<T>(operation: Promise<T>, timeoutMs?: number, // 30 seconds default
context?: string): Promise<T>;
export declare function setupGracefulShutdown(): void;
//# sourceMappingURL=databaseErrorHandler.d.ts.map