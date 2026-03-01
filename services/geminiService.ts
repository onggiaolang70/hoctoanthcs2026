
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Grade, Question, QuestionType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sanitizeString = (str: string): string => {
  if (!str) return "";
  return str
    // Remove environment tags which force display mode
    .replace(/\\begin\{equation\*?\}/g, '')
    .replace(/\\end\{equation\*?\}/g, '')
    .replace(/\\begin\{align\*?\}/g, '')
    .replace(/\\end\{align\*?\}/g, '')
    .replace(/\\begin\{gather\*?\}/g, '')
    .replace(/\\end\{gather\*?\}/g, '')
    // Normalize delimiters
    .replace(/\$\$/g, '$')       // Replace $$ with $
    .replace(/\\\[/g, '$')       // Replace \[ with $
    .replace(/\\\]/g, '$')       // Replace \] with $
    // Remove newlines
    .replace(/\\n/g, ' ')        // Replace escaped newlines
    .replace(/\n/g, ' ')         // Replace actual newlines
    .trim();
};

// Fix: Change model to gemini-3-flash-preview and implement generateMathQuestions
export const generateMathQuestions = async (
  grade: Grade,
  topic: string,
  difficulty: Difficulty,
  count: number,
  questionType: QuestionType | 'MIXED'
): Promise<Question[]> => {
  const model = "gemini-3-flash-preview";

  let typeInstruction = "";
  if (questionType === QuestionType.MULTIPLE_CHOICE) {
    typeInstruction = "Tất cả câu hỏi phải là dạng TRẮC NGHIỆM 4 đáp án (A, B, C, D).";
  } else if (questionType === QuestionType.TRUE_FALSE) {
    typeInstruction = "Tất cả câu hỏi phải là dạng ĐÚNG/SAI với 4 mệnh đề (a, b, c, d).";
  } else {
    typeInstruction = "Kết hợp ngẫu nhiên giữa câu hỏi TRẮC NGHIỆM và câu hỏi ĐÚNG/SAI.";
  }

  const prompt = `
    Tạo bộ ${count} câu hỏi Toán lớp ${grade} (THCS Việt Nam).
    Chủ đề: ${topic}.
    Độ khó: ${difficulty}.
    ${typeInstruction}
    
    Yêu cầu ĐỊNH DẠNG (QUAN TRỌNG):
    1. Trả về JSON thuần túy.
    2. Cú pháp LaTeX cho TOÀN BỘ biểu thức toán.
    3. BẮT BUỘC dùng dấu $ đơn cho công thức (ví dụ: $x^2$). TUYỆT ĐỐI KHÔNG dùng $$ hoặc \\[ \\].
    4. KHÔNG được xuống dòng (\\n) trong chuỗi văn bản.
    
    Cấu trúc JSON cho từng loại:
    - Trắc nghiệm (MULTIPLE_CHOICE):
      {
        "type": "MULTIPLE_CHOICE",
        "questionText": "...",
        "options": ["...", "...", "...", "..."],
        "correctAnswerIndex": 0 (0-3),
        "explanation": "..."
      }
    - Đúng/Sai (TRUE_FALSE):
      {
        "type": "TRUE_FALSE",
        "questionText": "Cho biểu thức...",
        "propositions": ["Mệnh đề a", "Mệnh đề b", "Mệnh đề c", "Mệnh đề d"],
        "correctAnswersTF": [true, false, true, false],
        "explanation": "..."
      }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: [QuestionType.MULTIPLE_CHOICE, QuestionType.TRUE_FALSE] },
              questionText: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.INTEGER },
              propositions: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswersTF: { type: Type.ARRAY, items: { type: Type.BOOLEAN } },
              explanation: { type: Type.STRING },
            },
            required: ["type", "questionText", "explanation"],
          },
        },
      },
    });

    if (response.text) {
      const rawQuestions = JSON.parse(response.text) as Question[];
      
      const sanitizedQuestions = rawQuestions.map((q, index) => ({
        ...q,
        id: `q-${Date.now()}-${index}`,
        questionText: sanitizeString(q.questionText),
        explanation: sanitizeString(q.explanation),
        options: q.options ? q.options.map(opt => sanitizeString(opt)) : undefined,
        propositions: q.propositions ? q.propositions.map(prop => sanitizeString(prop)) : undefined
      }));

      return sanitizedQuestions.slice(0, count);
    }
    throw new Error("Không nhận được dữ liệu từ Gemini.");
  } catch (error) {
    console.error("Lỗi khi tạo câu hỏi:", error);
    throw error;
  }
};

// Fix: Add balanceEquation function
export const balanceEquation = async (equation: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Cân bằng phương trình hóa học sau: ${equation}. Chỉ trả về phương trình đã cân bằng và giải thích ngắn gọn bằng tiếng Việt.`,
    });
    return response.text || "Không thể cân bằng phương trình này.";
  } catch (error) {
    console.error("Lỗi khi cân bằng phương trình:", error);
    return "Đã xảy ra lỗi khi kết nối với AI.";
  }
};

// Fix: Add getChemistryExplanation function
export const getChemistryExplanation = async (query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: "Bạn là một trợ lý ảo chuyên về Hóa học THPT Việt Nam. Hãy giải thích các khái niệm chi tiết, chính xác và dễ hiểu bằng tiếng Việt.",
      }
    });
    return response.text || "Xin lỗi, tôi không tìm thấy câu trả lời phù hợp.";
  } catch (error) {
    console.error("Lỗi khi giải đáp hóa học:", error);
    return "Xin lỗi, tớ đang gặp chút rắc rối kỹ thuật. Thử lại sau nhé!";
  }
};

// Fix: Add generateQuiz function
export const generateQuiz = async (grade: string, topic: string): Promise<Question[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tạo bộ 5 câu hỏi trắc nghiệm Hóa học lớp ${grade}, chủ đề: ${topic}. Mỗi câu có 4 đáp án, 1 đáp án đúng. Trả về định dạng JSON thuần túy.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: [QuestionType.MULTIPLE_CHOICE] },
              questionText: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
            required: ["type", "questionText", "options", "correctAnswerIndex", "explanation"],
          },
        },
      },
    });

    if (response.text) {
      const rawQuestions = JSON.parse(response.text) as Question[];
      return rawQuestions.map((q, index) => ({
        ...q,
        id: `quiz-q-${Date.now()}-${index}`,
        questionText: sanitizeString(q.questionText),
        explanation: sanitizeString(q.explanation),
        options: q.options ? q.options.map(opt => sanitizeString(opt)) : undefined
      }));
    }
    return [];
  } catch (error) {
    console.error("Lỗi khi tạo quiz:", error);
    throw error;
  }
};
