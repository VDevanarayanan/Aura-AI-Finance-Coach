"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true
            }
        });
        console.log('SUCCESS: Connected to DB.');
        console.log('Users found:', users);
    }
    catch (error) {
        console.error('ERROR: Failed to query DB:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
