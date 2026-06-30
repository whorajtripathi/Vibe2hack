import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Gemini API client
const apiKey = process.env.GEMINI_API_KEY || '';
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn('WARNING: GEMINI_API_KEY environment variable is not defined. Using smart mock fallback responses.');
}

// Define TypeScript structures
export interface AIPriorityItem {
  taskId: string;
  title: string;
  rank: number;
  reason: string;
}

export interface AIScheduleBlock {
  time: string;
  activity: string;
  taskId?: string;
  type: 'work' | 'break' | 'meal' | 'sleep';
}

export interface AIRiskWarning {
  taskId?: string;
  type: 'high_risk' | 'medium_risk' | 'low_risk';
  message: string;
}

export interface AIPlanResponse {
  priorityRanking: AIPriorityItem[];
  todaySchedule: AIScheduleBlock[];
  warnings: AIRiskWarning[];
  recommendations: string[];
  productivityTips: string[];
  motivation: string;
}

// Define the JSON schema for Gemini structured output
const responseSchema = {
  type: 'object',
  properties: {
    priorityRanking: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          taskId: { type: 'string' },
          title: { type: 'string' },
          rank: { type: 'number' },
          reason: { type: 'string' }
        },
        required: ['taskId', 'title', 'rank', 'reason']
      }
    },
    todaySchedule: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          time: { type: 'string' },
          activity: { type: 'string' },
          taskId: { type: 'string' },
          type: { type: 'string', enum: ['work', 'break', 'meal', 'sleep'] }
        },
        required: ['time', 'activity', 'type']
      }
    },
    warnings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          taskId: { type: 'string' },
          type: { type: 'string', enum: ['high_risk', 'medium_risk', 'low_risk'] },
          message: { type: 'string' }
        },
        required: ['type', 'message']
      }
    },
    recommendations: {
      type: 'array',
      items: { type: 'string' }
    },
    productivityTips: {
      type: 'array',
      items: { type: 'string' }
    },
    motivation: { type: 'string' }
  },
  required: ['priorityRanking', 'todaySchedule', 'warnings', 'recommendations', 'productivityTips', 'motivation']
};

/**
 * Generate a smart mock plan when Gemini API key is missing.
 * Analyzes the user's tasks to make the fallback feel alive and highly relevant.
 */
function generateSmartMockPlan(tasks: any[], profile: any): AIPlanResponse {
  const wakeTime = profile.wakeTime || '07:00';
  const sleepTime = profile.sleepTime || '23:00';
  const preferredStudyTime = profile.preferredStudyTime || 'evening';
  const style = profile.aiPreferences?.style || 'supportive';

  // Sort tasks by priority (high > medium > low) and urgency (earlier deadline first)
  const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'archived');
  const sortedTasks = [...activeTasks].sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const pDiff = priorityWeight[b.priority as 'high'|'medium'|'low'] - priorityWeight[a.priority as 'high'|'medium'|'low'];
    if (pDiff !== 0) return pDiff;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  // Create priority ranking
  const priorityRanking: AIPriorityItem[] = sortedTasks.map((task, index) => {
    let reason = '';
    const timeLeftHours = (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60);

    if (timeLeftHours < 24) {
      reason = `Urgent: Deadline is approaching in less than 24 hours (${Math.round(timeLeftHours)}h left).`;
    } else if (task.priority === 'high' && task.difficulty === 'hard') {
      reason = 'High impact and high complexity. Best tackled early in your energy cycle.';
    } else if (task.priority === 'high') {
      reason = 'Crucial for goals progression, high impact value.';
    } else {
      reason = 'Secondary task. Tackle once your high-priority items are wrapped up.';
    }

    return {
      taskId: task._id?.toString() || `mock-task-${index}`,
      title: task.title,
      rank: index + 1,
      reason
    };
  });

  // Create warnings
  const warnings: AIRiskWarning[] = [];
  let highRiskCount = 0;
  
  sortedTasks.forEach(task => {
    const timeLeftHours = (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    const estimatedTime = task.estimatedTime || 1;

    if (timeLeftHours <= 0) {
      warnings.push({
        taskId: task._id?.toString(),
        type: 'high_risk',
        message: `"${task.title}" deadline has already passed. Action required immediately!`
      });
      highRiskCount++;
    } else if (timeLeftHours < estimatedTime * 1.5) {
      warnings.push({
        taskId: task._id?.toString(),
        type: 'high_risk',
        message: `Extreme Risk: "${task.title}" requires ~${estimatedTime}h but you only have ${Math.round(timeLeftHours)}h before the deadline.`
      });
      highRiskCount++;
    } else if (timeLeftHours < estimatedTime * 3) {
      warnings.push({
        taskId: task._id?.toString(),
        type: 'medium_risk',
        message: `Tight Schedule: "${task.title}" has a deadline approaching soon. Buffer is less than 3x the estimated effort.`
      });
    }
  });

  if (activeTasks.length > 5) {
    warnings.push({
      type: 'medium_risk',
      message: `Cognitive Overload Warning: You have ${activeTasks.length} active tasks today. Consider archiving or postponing lower priority ones.`
    });
  }

  // Create schedule blocks
  const todaySchedule: AIScheduleBlock[] = [];
  const startHour = parseInt(wakeTime.split(':')[0]) || 7;
  const startMinute = parseInt(wakeTime.split(':')[1]) || 0;
  const endHour = parseInt(sleepTime.split(':')[0]) || 23;

  todaySchedule.push({ time: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')} AM`, activity: 'Wake Up & Morning Routine', type: 'break' });

  let currentHour = startHour + 1;

  // Add tasks to schedule
  let taskIndex = 0;
  while (currentHour < endHour && taskIndex < sortedTasks.length) {
    const task = sortedTasks[taskIndex];
    const duration = Math.min(2, Math.max(1, Math.round(task.estimatedTime || 1)));
    
    const displayHour = currentHour > 12 ? currentHour - 12 : currentHour;
    const ampm = currentHour >= 12 ? 'PM' : 'AM';
    
    todaySchedule.push({
      time: `${displayHour.toString().padStart(2, '0')}:00 ${ampm}`,
      activity: `Focus Session: ${task.title}`,
      taskId: task._id?.toString(),
      type: 'work'
    });

    currentHour += duration;

    // Add a break
    if (currentHour < endHour) {
      const breakHour = currentHour > 12 ? currentHour - 12 : currentHour;
      const breakAmpm = currentHour >= 12 ? 'PM' : 'AM';
      todaySchedule.push({
        time: `${breakHour.toString().padStart(2, '0')}:00 ${breakAmpm}`,
        activity: 'Rest & Recharge Break',
        type: 'break'
      });
      currentHour += 1;
    }
    
    taskIndex++;
  }

  // Fallback routines if day is not full or if there are no tasks
  if (currentHour < endHour - 1) {
    const afternoonHour = 13;
    const displayAfternoon = afternoonHour > 12 ? afternoonHour - 12 : afternoonHour;
    todaySchedule.push({ time: `${displayAfternoon}:00 PM`, activity: 'Healthy Lunch Break', type: 'meal' });
  }

  const sleepDisplayHour = endHour > 12 ? endHour - 12 : endHour;
  todaySchedule.push({ time: `${sleepDisplayHour}:00 PM`, activity: 'Wind down & Sleep', type: 'sleep' });

  // Custom recommendations and motivation based on AI preferences style
  let recommendations: string[] = [];
  let motivation = '';
  let productivityTips: string[] = [];

  if (style === 'tough_love') {
    recommendations = [
      'Stop scrolling and start working on your top task immediately.',
      'Cut down your meetings. You are running out of time.',
      'Postpone any non-critical personal tasks to the weekend.'
    ];
    motivation = highRiskCount > 0 
      ? `You have ${highRiskCount} tasks at high risk of failure. No excuses. Execute now.` 
      : 'Keep the momentum going. Discipline over motivation.';
    productivityTips = [
      'Use the 5-second rule: count down from 5 and launch into your work.',
      'Turn off all phone notifications. Put it in another room.'
    ];
  } else {
    // Supportive or Balanced
    recommendations = [
      'Focus on one task at a time. Multi-tasking will slow you down.',
      'Give yourself a break after completing your primary high-priority goal.',
      'Consider rescheduling low-value tasks to clear up cognitive space.'
    ];
    motivation = highRiskCount > 0
      ? `We have some tight deadlines ahead, but taking them step-by-step is fully manageable. You've got this!`
      : 'You are making great progress. Every small step forward counts!';
    productivityTips = [
      'The Pomodoro Technique: work for 25 minutes, rest for 5. Repeat.',
      'Keep hydrated. Dehydration reduces cognitive performance by 20%.'
    ];
  }

  return {
    priorityRanking,
    todaySchedule,
    warnings,
    recommendations,
    productivityTips,
    motivation
  };
}

/**
 * Calls Gemini to generate the productivity plan
 */
export async function generateAIPlan(tasks: any[], habits: any[], profile: any): Promise<AIPlanResponse> {
  if (!genAI) {
    return generateSmartMockPlan(tasks, profile);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema as any
      }
    });

    const currentTimeString = new Date().toISOString();
    const taskDetails = tasks.map(t => ({
      id: t._id?.toString(),
      title: t.title,
      description: t.description || '',
      category: t.category,
      priority: t.priority,
      difficulty: t.difficulty,
      estimatedTimeHours: t.estimatedTime,
      deadline: t.deadline,
      status: t.status,
      recurring: t.recurring
    }));

    const habitDetails = habits.map(h => ({
      name: h.name,
      streak: h.streak,
      bestStreak: h.bestStreak,
      completedToday: h.logs?.includes(new Date().toISOString().split('T')[0]) || false
    }));

    const prompt = `
You are the "LastMinute Hero" AI Productivity Coach, an elite executive assistant specialized in time management, cognitive load balancing, and high-performance execution.

Analyze the user's workload, profile settings, and habits. Generate an optimized daily schedule and prioritized productivity plan.

Current Time: ${currentTimeString}

User Profile Preferences:
- Wake time: ${profile.wakeTime || '07:00'}
- Sleep time: ${profile.sleepTime || '23:00'}
- Preferred study/focus time: ${profile.preferredStudyTime || 'evening'}
- AI personality tone: ${profile.aiPreferences?.style || 'supportive'}
- AI priority focus rules: ${profile.aiPreferences?.priorityFocus || 'balanced'}

Current Task Workload:
${JSON.stringify(taskDetails, null, 2)}

Current Habits Tracked:
${JSON.stringify(habitDetails, null, 2)}

Instructions:
1. **Priority Ranking**: Prioritize tasks considering deadlines, estimated hours, and impact. Explain clearly why each is ranked.
2. **Schedule Builder**: Create an hourly schedule for the day starting from wakeTime up to sleepTime. Assign specific tasks to time blocks. Include meal times, rest breaks (15-30m every 2 hours of focus), and winding down periods.
3. **Deadline Risk Predictor**: Analyze if tasks are at risk of missing deadlines (e.g. not enough hours remaining, overlapping tasks, or too close to deadline). Provide warning notices with actionable explanations.
4. **Actionable Recommendations**: Identify low-value or low-priority items that should be postponed, rescheduled, or archived. Suggest which task to execute first.
5. **Productivity Tips & Motivation**: Provide 2-3 psychological or physical productivity hacks tailored to the current workload, and direct motivation reflecting the user's preferred AI tone style (${profile.aiPreferences?.style}).

Your response must strictly match the requested JSON Schema format. Return ONLY the JSON object.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text) as AIPlanResponse;
  } catch (error) {
    console.error('Error generating AI plan from Gemini:', error);
    // Graceful fallback to smart mock generator
    return generateSmartMockPlan(tasks, profile);
  }
}
