"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get('/monthly', report_controller_1.getMonthlyReport);
exports.default = router;
