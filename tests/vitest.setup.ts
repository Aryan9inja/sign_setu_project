import dotenv from "dotenv";
import { resolve } from "path";
import { getStudentJwt, getTeacherJwt } from "./utils/auth";
import { beforeAll } from "vitest";

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, "../.env.test") });

// Assign JWTs to process.env so tests can use them
beforeAll(async () => {
  try {
    const studentJwt = await getStudentJwt();
    const teacherJwt = await getTeacherJwt();
    
    process.env.STUDENT_JWT = studentJwt;
    process.env.TEACHER_JWT = teacherJwt;

    // Extract user IDs from JWT tokens for tests
    const studentPayload = JSON.parse(atob(studentJwt.split('.')[1]));
    const teacherPayload = JSON.parse(atob(teacherJwt.split('.')[1]));
    
    process.env.STUDENT_USER_ID = studentPayload.sub;
    // For OTHER_STUDENT_ID, we'll use the teacher's ID as a different user
    process.env.OTHER_STUDENT_ID = teacherPayload.sub;
    
  } catch (error) {
    console.error("Failed to authenticate test users:", error);
    throw error;
  }
});
