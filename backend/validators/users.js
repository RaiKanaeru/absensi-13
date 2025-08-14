const { z } = require("zod");

const userRoles = ["admin", "teacher", "guru"];

const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(userRoles, {
      errorMap: () => ({ message: "Role must be one of: admin, teacher, guru" }),
    }),
  }),
});

const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "User ID must be a number"),
  }),
  body: z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    role: z.enum(userRoles, {
      errorMap: () => ({ message: "Role must be one of: admin, teacher, guru" }),
    }),
  }),
});

const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "User ID must be a number"),
  }),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
};