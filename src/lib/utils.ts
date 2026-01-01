import { createClient } from "@supabase/supabase-js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/* ---------------- UTILITY ---------------- */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ---------------- SUPABASE CLIENT ---------------- */
// TEMPORARY: hard-coded values (move to .env later)
const supabaseUrl = "https://aeviisivrresyjrtkhah.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFldmlpc2l2cnJlc3lqcnRraGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MTgzNjEsImV4cCI6MjA3OTM5NDM2MX0.9PvXEeigWLlBpz3zN7Hik8x7JsZzb3TuOBxWvzVgd5gS";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ---------------- JOB QUERIES ---------------- */

// Get all jobs
export async function getJobs() {
  const { data, error } = await supabase
    .from("jobs") // ✅ FIXED: lowercase table name
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching jobs:", error.message);
    return [];
  }

  return data || [];
}

// Get single job by ID
export async function getJobById(id: string) {
  const { data, error } = await supabase
    .from("jobs") // ✅ FIXED
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching job:", error.message);
    return null;
  }

  return data;
}

// Create a new job
export async function createJob(job: {
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
}) {
  const { error } = await supabase
    .from("jobs") // ✅ FIXED
    .insert([job]);

  if (error) {
    console.error("Error creating job:", error.message);
    return false;
  }

  return true;
}
