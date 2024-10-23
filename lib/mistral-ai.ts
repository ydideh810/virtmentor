import axios from 'axios';

const MISTRAL_API_KEY = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

async function mistralApiCall(prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: 'mistral-tiny',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling Mistral AI API:', error);
    throw new Error('Failed to generate content using Mistral AI');
  }
}

export async function generateLearningPath(skill: string, experience: string): Promise<string> {
  const prompt = `Generate a detailed learning path for ${skill} at ${experience} level. Include specific steps, resources, and milestones.`;
  return mistralApiCall(prompt);
}

export async function generateWeeklyGoals(skill: string, experience: string): Promise<string> {
  const prompt = `Create a list of weekly goals for someone learning ${skill} at ${experience} level. Include specific tasks, projects, and learning objectives.`;
  return mistralApiCall(prompt);
}

export async function generateMonthlyGoals(skill: string, experience: string): Promise<string> {
  const prompt = `Create a list of monthly goals for someone learning ${skill} at ${experience} level. Include broader objectives, project ideas, and skill milestones to achieve over the course of a month.`;
  return mistralApiCall(prompt);
}

export async function generateYearlyGoals(skill: string, experience: string): Promise<string> {
  const prompt = `Create a list of yearly goals for someone learning ${skill} at ${experience} level. Include long-term objectives, major projects, and significant skill improvements to achieve over the course of a year.`;
  return mistralApiCall(prompt);
}