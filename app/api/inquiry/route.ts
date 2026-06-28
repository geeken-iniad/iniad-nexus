import { NextResponse } from "next/server";
import {
  INQUIRY_CATEGORY_OPTIONS,
  type InquiryCategory,
  type InquiryFormValues,
} from "@/types/inquiry";

export const runtime = "nodejs";

type InquiryWebhookPayload = {
  content: string;
  embeds: Array<{
    title: string;
    description: string;
    fields: Array<{ name: string; value: string; inline?: boolean }>;
    footer: { text: string };
    timestamp: string;
  }>;
  source_app: "iniad-nexus";
  submitted_at: string;
  inquiry_type: InquiryCategory;
  inquiry_type_label: string;
  subject: string | null;
  inquiry_content: string;
  student_number: string | null;
  is_anonymous: boolean;
};

const INQUIRY_WEBHOOK_URL = process.env.INQUIRY_WEBHOOK_URL;

function isInquiryCategory(value: unknown): value is InquiryCategory {
  return INQUIRY_CATEGORY_OPTIONS.some((option) => option.value === value);
}

function getCategoryLabel(category: InquiryCategory): string {
  return INQUIRY_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category;
}

function parseRequestBody(body: unknown): InquiryFormValues {
  if (typeof body !== "object" || body === null) {
    throw new Error("リクエスト形式が不正です");
  }

  const raw = body as Partial<Record<keyof InquiryFormValues, unknown>>;

  if (!isInquiryCategory(raw.category)) {
    throw new Error("お問い合わせ種別が不正です");
  }

  const content = typeof raw.content === "string" ? raw.content.trim() : "";
  if (!content) {
    throw new Error("お問い合わせ内容は必須です");
  }

  const isAnonymous = Boolean(raw.isAnonymous);
  const subject = typeof raw.subject === "string" ? raw.subject.trim() : "";
  const studentNumber = typeof raw.studentNumber === "string" ? raw.studentNumber.trim() : "";

  if (!isAnonymous && !studentNumber) {
    throw new Error("学籍番号を入力してください");
  }

  return {
    category: raw.category,
    subject,
    content,
    studentNumber,
    isAnonymous,
  };
}

export async function POST(request: Request) {
  if (!INQUIRY_WEBHOOK_URL) {
    return NextResponse.json(
      { message: "INQUIRY_WEBHOOK_URL が未設定です" },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "JSON の解析に失敗しました" }, { status: 400 });
  }

  let formValues: InquiryFormValues;
  try {
    formValues = parseRequestBody(body);
  } catch (error: unknown) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "入力内容が不正です" },
      { status: 400 },
    );
  }

  const payload: InquiryWebhookPayload = {
    content: `[お問い合わせ] 【${getCategoryLabel(formValues.category)}】${formValues.subject ? ` / ${formValues.subject}` : ""}`,
    embeds: [
      {
        title: "INIAD Nexus お問い合わせ",
        description: formValues.content,
        fields: [
          {
            name: "お問い合わせ種別",
            value: getCategoryLabel(formValues.category),
            inline: true,
          },
          {
            name: "学籍番号",
            value: formValues.isAnonymous ? "匿名" : formValues.studentNumber,
            inline: true,
          },
        ],
        footer: { text: "INIAD Nexus" },
        timestamp: new Date().toISOString(),
      },
    ],
    source_app: "iniad-nexus",
    submitted_at: new Date().toISOString(),
    inquiry_type: formValues.category,
    inquiry_type_label: getCategoryLabel(formValues.category),
    subject: formValues.subject || null,
    inquiry_content: formValues.content,
    student_number: formValues.isAnonymous ? null : formValues.studentNumber,
    is_anonymous: formValues.isAnonymous,
  };

  const webhookResponse = await fetch(INQUIRY_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!webhookResponse.ok) {
    const responseText = await webhookResponse.text().catch(() => "");
    return NextResponse.json(
      {
        message: "Webhook への送信に失敗しました",
        status: webhookResponse.status,
        detail: responseText || null,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ message: "送信しました" });
}