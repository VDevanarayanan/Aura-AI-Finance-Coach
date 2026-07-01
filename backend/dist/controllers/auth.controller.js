"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const JWT_SECRET = process.env.JWT_SECRET ||
    'finance_coach_super_secure_jwt_secret_token_2026_phrase';
const register = async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return res
            .status(400)
            .json({ error: 'Please provide email, password, and name.' });
    }
    try {
        const existingUser = await db_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res
                .status(400)
                .json({ error: 'User with this email already exists.' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '7d',
        });
        return res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'An error occurred during registration.' });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res
            .status(400)
            .json({ error: 'Please provide email and password.' });
    }
    try {
        const user = await db_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '7d',
        });
        return res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'An error occurred during login.' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated.' });
    }
    try {
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        return res.status(200).json({ user });
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ error: 'An error occurred fetching profile.' });
    }
};
exports.getMe = getMe;
