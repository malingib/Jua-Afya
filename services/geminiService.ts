
import { GoogleGenAI, Chat } from "@google/genai";

const apiKey = process.env.API_KEY || '';
// Initialize.
const ai = new GoogleGenAI({ apiKey });

// Helper to check if key is present
export const hasApiKey = () => !!apiKey;

/**
 * Summarizes patient notes or converts unstructured notes into SOAP format.
 * Uses gemini-2.5-flash for speed.
 */
export const analyzePatientNotes = async (notes: string): Promise<string> => {
  if (!apiKey) return "API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a medical assistant for a clinic in Kenya. 
      Analyze the following patient notes and format them into a concise SOAP (Subjective, Objective, Assessment, Plan) format. 
      Keep it brief and professional.
      
      Notes: "${notes}"`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error processing notes.";
  }
};

/**
 * Generates a short, friendly SMS reminder for a patient.
 * Uses gemini-2.5-flash.
 */
export const draftAppointmentSms = async (patientName: string, date: string, reason: string): Promise<string> => {
  if (!apiKey) return "API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Draft a short, polite, and friendly SMS reminder (max 160 chars) for a patient named ${patientName}.
      They have an appointment for "${reason}" on ${date}.
      The tone should be professional but caring, suitable for a small clinic in Kenya. 
      You can use a mix of English and Swahili (Sheng) if it sounds natural, but primarily English.
      Do not include placeholders like [Your Name]. Sign off as 'JuaAfya Clinic'.`,
    });
    return response.text?.trim().replace(/^"|"$/g, '') || "Could not draft SMS.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Hello ${patientName}, reminder for your appointment on ${date}. - JuaAfya Clinic`;
  }
};

/**
 * Generates marketing or general broadcast SMS content.
 * Uses gemini-2.5-flash.
 */
export const draftCampaignMessage = async (topic: string, tone: string): Promise<string> => {
    if (!apiKey) return "API Key missing.";
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Draft a short, engaging SMS broadcast (max 160 chars) for a health clinic in Kenya.
        Topic: "${topic}"
        Tone: ${tone} (e.g., Professional, Urgent, Friendly, Educational).
        Target Audience: Patients.
        Language: English (can use common Kenyan phrases if appropriate).
        Call to action: Visit JuaAfya Clinic or call +254712345678.
        Do not use placeholders.`,
      });
      return response.text?.trim().replace(/^"|"$/g, '') || "Could not draft campaign.";
    } catch (error) {
      return `Health Alert: ${topic}. Visit JuaAfya Clinic for more info.`;
    }
  };

/**
 * Generates a daily executive summary for the doctor based on stats.
 * Uses gemini-2.5-flash.
 */
export const generateDailyBriefing = async (
  appointmentCount: number, 
  lowStockCount: number, 
  revenueEstimate: string
): Promise<string> => {
  if (!apiKey) return "Welcome, Daktari. System ready.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an intelligent clinic operations assistant. 
      Generate a 2-sentence "Daily Briefing" for the doctor.
      Data: 
      - Appointments today: ${appointmentCount}
      - Low stock items: ${lowStockCount}
      - Est. Revenue: ${revenueEstimate}
      
      Highlight action items (like restocking) if necessary, otherwise be encouraging.`,
    });
    return response.text || "Welcome back, Daktari.";
  } catch (error) {
    return "Welcome back, Daktari. Systems operational.";
  }
};

/**
 * Staff WhatsApp Agent Response
 * Generates response for clinic staff based on system data context.
 * Returns structured JSON to support actions (Add/Edit/Delete).
 */
export const getStaffAssistantResponse = async (
    userQuery: string,
    context: any // Object containing full system data
): Promise<any> => {
    if (!apiKey) return { reply: "API Key missing. Cannot process request." };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are the 'JuaAfya Ops Bot', a capable assistant for ${context.clinic?.name || 'the clinic'}.
            You have FULL ACCESS to read and MODIFY the clinic's data.

            Current Data Context:
            - Patients: ${JSON.stringify(context.patients || [])}
            - Appointments: ${JSON.stringify(context.appointments || [])}
            - Inventory: ${JSON.stringify(context.inventory || [])}
            - Today: ${context.today}

            User Query: "${userQuery}"

            INSTRUCTIONS:
            1. You must respond in valid JSON format ONLY. Do not include markdown blocks like \`\`\`json.
            2. Structure: { "reply": "string", "action": { "type": "string", "payload": object } | null }
            3. If the user asks a question, answer in 'reply' and set 'action' to null.
            4. If the user wants to ADD, UPDATE, or DELETE data, set the 'action' field.
            
            AVAILABLE ACTIONS:
            - ADD_PATIENT: payload { name, phone, age, gender (Male/Female) }
            - EDIT_PATIENT: payload { patientId, updates: { name?, phone?, age?, gender?, notes? } }
            - DELETE_PATIENT: payload { patientId }
            
            - ADD_APPOINTMENT: payload { patientId (find closest match or ask), date (YYYY-MM-DD), time (HH:MM), reason }
            - EDIT_APPOINTMENT: payload { appointmentId, updates: { date?, time?, reason? } }
            - CANCEL_APPOINTMENT: payload { appointmentId }
            
            - UPDATE_STOCK: payload { itemId (preferred) or itemName, newQuantity }
            - DELETE_ITEM: payload { itemId (preferred) or itemName }

            RULES:
            - Prioritize brevity in 'reply'. Use bullet points for lists. No emojis.
            - If details are missing for an action (e.g., patient age), ask the user for them in 'reply' and set 'action' to null.
            - Infer dates like 'tomorrow' based on ${context.today}.
            - For EDIT actions, 'updates' object should only contain changed fields.
            - When updating or deleting, prefer using ID if available in context, otherwise use name.
            `,
            config: {
                responseMimeType: "application/json" 
            }
        });
        
        const text = response.text || "{}";
        
        // Robust JSON extraction: Find the first { and last }
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.error("JSON Parse Error", e);
                return { reply: "I understood your request but had trouble formatting the response.", action: null };
            }
        } else {
             return { reply: "System Error: Invalid response format from AI.", action: null };
        }

    } catch (error) {
        console.error("Gemini Staff Agent Error:", error);
        return { reply: "System error: Unable to process request at this time." };
    }
};

/**
 * Chatbot initialization.
 * Uses gemini-3-pro-preview for complex reasoning.
 */
let chatSession: Chat | null = null;

export const getChatSession = () => {
  if (!apiKey) return null;
  
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: "You are 'JuaAfya Assistant', a helpful AI assistant for a small health clinic in Kenya. You help the clinic staff (nurses, doctors, receptionists) with general medical questions, drafting SMS reminders for patients, interpreting lab results ranges, and suggesting operational improvements. You are NOT a doctor and must always clarify that your advice does not replace professional medical judgment. Keep answers concise, practical, and friendly. Use simple English or Swahili if requested.",
      },
    });
  }
  return chatSession;
};

export const sendMessageToChat = async (message: string): Promise<string> => {
  const chat = getChatSession();
  if (!chat) return "API Key is missing or service unavailable.";

  try {
    const response = await chat.sendMessage({ message });
    return response.text || "No response.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Sorry, I'm having trouble connecting right now. Please check your internet connection.";
  }
};
