'use server';

/**
 * @fileOverview A flow that analyzes historical attendance data and alerts users if a student's attendance dips below a healthy amount.
 *
 * - predictiveAttendanceAlert - A function that triggers the attendance analysis and alert process.
 * - PredictiveAttendanceAlertInput - The input type for the predictiveAttendanceAlert function.
 * - PredictiveAttendanceAlertOutput - The return type for the predictiveAttendanceAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveAttendanceAlertInputSchema = z.object({
  studentId: z.string().describe('The ID of the student to analyze.'),
  attendanceData: z.string().describe('Historical attendance data for the student in JSON format, including dates and attendance status.'),
});
export type PredictiveAttendanceAlertInput = z.infer<typeof PredictiveAttendanceAlertInputSchema>;

const PredictiveAttendanceAlertOutputSchema = z.object({
  alert: z.boolean().describe('Whether an alert should be triggered based on the attendance analysis.'),
  reason: z.string().describe('The reason for the alert, including the number of days absent and the analysis.'),
});
export type PredictiveAttendanceAlertOutput = z.infer<typeof PredictiveAttendanceAlertOutputSchema>;

export async function predictiveAttendanceAlert(input: PredictiveAttendanceAlertInput): Promise<PredictiveAttendanceAlertOutput> {
  return predictiveAttendanceAlertFlow(input);
}

const determineUnhealthyAbsenceThreshold = ai.defineTool({
  name: 'determineUnhealthyAbsenceThreshold',
  description: 'Determines the threshold for an unhealthy number of absences based on the student attendance history duration.',
  inputSchema: z.object({
    attendanceData: z.string().describe('The student attendance data history in JSON format.'),
  }),
  outputSchema: z.object({
    absences: z.number().describe("The number of absences considered unhealthy."),
    duration: z.string().describe("The duration over which the absences were observed."),
  }),
  
},
async (input) => {
    // Dummy implementation - replace with actual logic
    const attendance = JSON.parse(input.attendanceData);
    const totalDays = attendance.length;
    const unhealthyAbsences = Math.ceil(totalDays * 0.2); // Example: 20% absence threshold
    return {
      absences: unhealthyAbsences,
      duration: 'last ' + totalDays + ' days',
    };
  }
);


const prompt = ai.definePrompt({
  name: 'predictiveAttendanceAlertPrompt',
  input: {schema: PredictiveAttendanceAlertInputSchema},
  output: {schema: PredictiveAttendanceAlertOutputSchema},
  tools: [determineUnhealthyAbsenceThreshold],
  prompt: `You are an AI assistant that analyzes student attendance data to determine if an alert should be triggered.

  Analyze the following student attendance data and determine if the student's attendance is below a healthy level. Use the determineUnhealthyAbsenceThreshold tool to determine what an unhealthy number of absences is.

  Student ID: {{{studentId}}}
  Attendance Data: {{{attendanceData}}}

  Based on your analysis, determine whether an alert should be triggered (alert: true/false) and provide a reason for the alert.
  If the attendance is healthy, alert should be false and provide a positive reason.
`,
});

const predictiveAttendanceAlertFlow = ai.defineFlow(
  {
    name: 'predictiveAttendanceAlertFlow',
    inputSchema: PredictiveAttendanceAlertInputSchema,
    outputSchema: PredictiveAttendanceAlertOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
