import { Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
 const router = Router();

// Secret key for JWT (ensure this is stored in an environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

/**
 * POST /register
 * Registers a new user with a username, email, and hashed master password.
 */
router.post("/register", async (req:any, res: any) => {
  try {
    const { username, email, masterPassword } = req.body;

    // Validate input
    if (!username || !email || !masterPassword) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

    // Hash the master password
    const hashedMasterPassword = await bcrypt.hash(masterPassword, 10);

    // Create the new user in the database
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        hashedMasterPassword,
      },
    });

    // Generate a JWT token
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: "1h" });

    // Return the user details and token
    return res.status(201).json({
      message: "User registered successfully.",
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * POST /login
 * Logs in a user by validating email and password, and returns a JWT token.
 */
router.post("/login", async (req: any, res: any) => {
  try {
    const { email, masterPassword } = req.body;

    // Validate input
    if (!email || !masterPassword) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Verify the master password
    const isPasswordValid = await bcrypt.compare(masterPassword, user.hashedMasterPassword);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

    // Return success response
    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;