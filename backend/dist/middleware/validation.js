"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
// Simple validation middleware
function validateRequest(schema) {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    error: "Validation failed",
                    details: result.error.issues
                });
            }
            req.body = result.data;
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=validation.js.map