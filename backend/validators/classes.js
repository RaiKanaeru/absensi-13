const { z } = require("zod");

const getOrDeleteClassSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Class ID must be a number"),
  }),
});

const createClassSchema = z.object({
  body: z.object({
    class_name: z.string().min(1, "Class name is required"),
    grade_level: z.number().int(),
    major: z.string().optional(),
    class_number: z.number().int(),
    homeroom_teacher_id: z.number().int().optional(),
  }),
});

const updateClassSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Class ID must be a number"),
  }),
  body: z.object({
    class_name: z.string().min(1, "Class name is required").optional(),
    grade_level: z.number().int().optional(),
    major: z.string().optional(),
    class_number: z.number().int().optional(),
    homeroom_teacher_id: z.number().int().optional(),
  }),
});

module.exports = {
  getOrDeleteClassSchema,
  createClassSchema,
  updateClassSchema,
};