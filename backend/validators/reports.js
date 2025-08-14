const { z } = require("zod");

const getReportSchema = z.object({
  params: z.object({
    classId: z.string().regex(/^\d+$/, "Class ID must be a number"),
  }),
  query: z.object({
    month: z.string().regex(/^(1[0-2]|[1-9])$/, "Month must be a number between 1 and 12"),
    year: z.string().regex(/^\d{4}$/, "Year must be a 4-digit number"),
  }),
});

const exportReportSchema = z.object({
  query: z.object({
    classId: z.string().regex(/^\d+$/, "Class ID must be a number"),
    month: z.string().regex(/^(1[0-2]|[1-9])$/, "Month must be a number between 1 and 12"),
    year: z.string().regex(/^\d{4}$/, "Year must be a 4-digit number"),
  }),
});

module.exports = {
  getReportSchema,
  exportReportSchema,
};