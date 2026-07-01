"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const envPath = path_1.default.resolve(__dirname, '../../.env');
console.log('[DEBUG] __dirname is:', __dirname);
console.log('[DEBUG] Resolved envPath is:', envPath);
// Load environment variables relative to this source file
const envResult = dotenv_1.default.config({ path: envPath, override: true });
if (envResult.error) {
    console.error('[DEBUG] dotenv load error:', envResult.error);
}
else {
    console.log('[DEBUG] dotenv loaded successfully. keys:', Object.keys(envResult.parsed || {}));
    // Force manual override copy to process.env
    if (envResult.parsed) {
        for (const key of Object.keys(envResult.parsed)) {
            process.env[key] = envResult.parsed[key];
        }
    }
}
console.log('[DEBUG] process.env.PORT is:', process.env.PORT);
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const transaction_routes_1 = __importDefault(require("./routes/transaction.routes"));
const budget_routes_1 = __importDefault(require("./routes/budget.routes"));
const goal_routes_1 = __importDefault(require("./routes/goal.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable CORS with support for frontend clients
app.use((0, cors_1.default)({
    origin: '*', // In production, refine to specific domains if needed
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Body Parser Middleware
app.use(express_1.default.json());
// Routes Mount
app.use('/api/auth', auth_routes_1.default);
app.use('/api/transactions', transaction_routes_1.default);
app.use('/api/budgets', budget_routes_1.default);
app.use('/api/savings-goals', goal_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
    });
});
// Serve frontend static assets in production
if (process.env.NODE_ENV === 'production') {
    const frontendPath = path_1.default.resolve(process.cwd(), '../frontend/dist');
    app.use(express_1.default.static(frontendPath));
    // Wildcard redirect to index.html for React Router
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path_1.default.join(frontendPath, 'index.html'));
    });
}
// 404 Route Catch-all
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found.' });
});
// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    const status = err.status || 500;
    res.status(status).json({
        error: err.message || 'An internal server error occurred.',
    });
});
// Boot Server
app.listen(PORT, () => {
    console.log(`[Finance Assistant Backend] Server running on port ${PORT}`);
});
exports.default = app;
