import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { signToken } from "../utils/jwt.js";
import { env } from "../config/env.js";

const SALT_ROUNDS = 12;

function roleForEmail(email) {
  return env.adminEmails.includes(String(email || "").toLowerCase()) ? "admin" : "user";
}

async function syncRoleFromEnv(user) {
  const nextRole = roleForEmail(user.email);
  if (nextRole !== user.role) {
    user.role = nextRole;
    await user.save();
  }
  return user.role;
}

export async function registerUser({ name, email, password }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: passwordHash,
    plan: "free",
    role: roleForEmail(email)
  });

  const token = signToken(user._id.toString());
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      role: user.role,
      autoApplyEnabled: user.autoApplyEnabled,
      autoApplyLimit: user.autoApplyLimit,
      createdAt: user.createdAt
    }
  };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const role = await syncRoleFromEnv(user);
  const token = signToken(user._id.toString());
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      role,
      autoApplyEnabled: user.autoApplyEnabled,
      autoApplyLimit: user.autoApplyLimit,
      createdAt: user.createdAt
    }
  };
}
