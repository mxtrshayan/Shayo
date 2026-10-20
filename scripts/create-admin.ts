import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const terminal = createInterface({ input, output });
const email = (await terminal.question("Admin email: ")).trim().toLowerCase();
const password = await terminal.question("Admin password (minimum 12 characters): ");
terminal.close();

if (!email || password.length < 12) {
  throw new Error("A valid email and a password of at least 12 characters are required.");
}

const passwordHash = await bcrypt.hash(password, 12);
await prisma.adminUser.upsert({
  where: { email },
  update: { passwordHash },
  create: { email, passwordHash },
});
console.log(`Admin account ready for ${email}`);
await prisma.$disconnect();
