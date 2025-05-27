import { json } from '@remix-run/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all questions
export async function loader() {
  try {
    const questions = await prisma.question.findMany({
      include: {
        options: true,
      },
    });

    return json(questions); // return actual data!
  } catch (error) {
    console.error("Failed to load questions:", error);
    return json({ error: "Failed to load questions" }, { status: 500 });
  }
}

// POST to create question
export async function action({ request }) {
  try {
    const body = await request.json();

    const { text, type, options } = body;

    if (!text || !type || !Array.isArray(options)) {
      return json({ error: "Invalid data" }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        text,
        type,
        options: {
          create: options.map((opt) => ({
            text: opt.text,
            productIds: opt.productIds,
          })),
        },
      },
    });

    return json({ message: "Question created successfully", question });
  } catch (err) {
    console.error("API error:", err);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
