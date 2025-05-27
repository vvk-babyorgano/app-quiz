import { json } from '@remix-run/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function action({ request, params }) {
  const { id } = params;
  const method = request.method;

  try {
    if (method === "PUT") {
      const body = await request.json();
      const { text, type, options } = body;

      if (!text || !type || !Array.isArray(options)) {
        return json({ error: "Invalid data" }, { status: 400 });
      }

      // Delete existing options first
      await prisma.option.deleteMany({ where: { questionId: id } });

      // Update the question
      const updated = await prisma.question.update({
        where: { id },
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
        include: { options: true },
      });

      return json({ message: "Question updated", question: updated });

    } else if (method === "DELETE") {
      await prisma.option.deleteMany({ where: { questionId: id } });
      await prisma.question.delete({ where: { id } });

      return json({ message: "Question deleted" });
    }

    return json({ error: "Method not allowed" }, { status: 405 });

  } catch (err) {
    console.error("API error:", err);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
