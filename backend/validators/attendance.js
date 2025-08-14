const { z } = require("zod");

const getTodaysScheduleSchema = z.object({
  params: z.object({
    teacherId: z.string().regex(/^\d+$/, "Teacher ID must be a number"),
  }),
});

const getScheduleSchema = z.object({
  params: z.object({
    scheduleId: z.string().regex(/^\d+$/, "Schedule ID must be a number"),
  }),
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  }),
});

const recordAttendanceSchema = z.object({
  body: z.object({
    schedule_id: z.number().int(),
    attendance_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    records: z.array(
      z.object({
        student_id: z.number().int(),
        status: z.enum(["Hadir", "Sakit", "Izin", "Alpa", "Terlambat"]),
      })
    ),
  }),
});

module.exports = {
  getTodaysScheduleSchema,
  getScheduleSchema,
  recordAttendanceSchema,
};