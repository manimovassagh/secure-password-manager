import { Request, Response, Router, RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

interface RegisterRequestBody {
  username: string;
  email: string;
  masterPassword: string;
}

interface LoginRequestBody {
  email: string;
  masterPassword: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const registerHandler: RequestHandler<{}, any, RegisterRequestBody> = async (req, res) => {
  try {
    const { username, email, masterPassword } = req.body;

    if (!username || !email || !masterPassword) {
      res.status(400).json({ error: "All fields are required." });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: "User already exists." });
      return;
    }

    const hashedMasterPassword = await bcrypt.hash(masterPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        hashedMasterPassword,
      },
    });

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
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
    res.status(500).json({ error: "Internal server error." });
  }
};

const loginHandler: RequestHandler<{}, any, LoginRequestBody> = async (req, res) => {
  try {
    const { email, masterPassword } = req.body;

    if (!email || !masterPassword) {
      res.status(400).json({ error: "All fields are required." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(400).json({ error: "Invalid email or password." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(masterPassword, user.hashedMasterPassword);

    if (!isPasswordValid) {
      res.status(400).json({ error: "Invalid email or password." });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
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
    res.status(500).json({ error: "Internal server error." });
  }
};

router.post("/register", registerHandler);
router.post("/login", loginHandler);

export default router;