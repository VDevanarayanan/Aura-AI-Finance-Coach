"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth middleware to all transaction routes
router.use(auth_1.authMiddleware);
router.get('/', transaction_controller_1.getTransactions);
router.post('/', transaction_controller_1.createTransaction);
router.put('/:id', transaction_controller_1.updateTransaction);
router.delete('/:id', transaction_controller_1.deleteTransaction);
exports.default = router;
