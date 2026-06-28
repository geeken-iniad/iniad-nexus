"use client";

import { useEffect, useState } from "react";
import {
    INQUIRY_CATEGORY_OPTIONS,
    type InquiryFormValues,
} from "@/types/inquiry";

const initialValues: InquiryFormValues = {
    category: "bug_report",
    subject: "",
    content: "",
    studentNumber: "",
    isAnonymous: false,
};

export default function InquiryForm() {
    const [values, setValues] = useState<InquiryFormValues>(initialValues);
    const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{success: boolean; message: string} | null>(null);
    useEffect(() => {
        const loadCurrentUser = async () => {
            try {
                const response = await fetch("/api/calendar-user");
                if (!response.ok) return;
                const user = (await response.json()) as { email?: string | null } | null;
                const rawStudentNumber = user?.email?.split("@")[0] ?? "";
                const normalizedStudentNumber = rawStudentNumber.startsWith("s")
                ? rawStudentNumber.slice(1)
                : rawStudentNumber;
                const studentNumberMatch = normalizedStudentNumber.match(/^(1f\d{8})\d?$/i);
                const studentNumber = studentNumberMatch?.[1] ?? normalizedStudentNumber;
                if (studentNumber) {
                    setValues((current) => ({
                        ...current,
                        studentNumber,
                    }));
                }
            } catch {
                // 自動取得に失敗した場合は手入力を許可する
            }
        };
        loadCurrentUser();
    }, []);
    const updateValue = <K extends keyof InquiryFormValues>(key: K, value: InquiryFormValues[K]) => {
        setValues((current) => ({
            ...current,
            [key]: value,
        }));
    };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);
        setSubmitStatus(null);
      setIsSubmitting(true);
        try{
            const res=await fetch('/api/inquiry',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify(values),
            })
            const data=await res.json();
            if(!res.ok){
              const detailText = data.detail ? ` (${data.detail})` : '';
              const statusText = data.status ? ` [${data.status}]` : '';
              throw new Error(`${data.message || '送信に失敗しました'}${statusText}${detailText}`);
            }
            setSubmitStatus({success:true,message:'送信に成功しました'});
      }catch(error:unknown){
        setSubmitStatus({
          success:false,
          message:error instanceof Error ? error.message : '送信に失敗しました',
        });
        }finally{
        setIsSubmitting(false);
            setSubmitted(false);
        };
    }  
    return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.12)] backdrop-blur-md sm:p-8"
    >
      <div className="mb-6 space-y-2">
        <p className="text-sm font-semibold tracking-[0.16em] text-[#247fc1]">INQUIRY FORM</p>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">お問い合わせフォーム</h1>
        <p className="text-sm leading-6 text-slate-600">
          不具合報告、機能要望、感想をまとめて送れます。学籍番号は匿名送信にも切り替えできます。
        </p>
      </div>

      {submitted && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          入力内容を受け付けました。現在はフォームUIの作成段階です。
        </div>
      )}

      {submitStatus && (
        <div
          className={[
            "mb-6 rounded-2xl px-4 py-3 text-sm",
            submitStatus.success
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-rose-200 bg-rose-50 text-rose-700",
          ].join(" ")}
        >
          {submitStatus.message}
        </div>
      )}

      <div className="space-y-5">
        <fieldset className="space-y-3">
          <legend className="text-sm font-bold text-slate-700">
            お問い合わせ種別 <span className="text-rose-500">*</span>
          </legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {INQUIRY_CATEGORY_OPTIONS.map((option) => {
              const isSelected = values.category === option.value;

              return (
                <label
                  key={option.value}
                  className={[
                    "flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-all",
                    isSelected
                      ? "border-[#247fc1] bg-[#eef9ff] shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <input
                    name="category"
                    type="radio"
                    required
                    value={option.value}
                    checked={isSelected}
                    onChange={() => updateValue("category", option.value)}
                    className="mt-1 h-4 w-4 border-slate-300 text-[#247fc1] focus:ring-[#247fc1]"
                  />
                  <span className="text-sm font-semibold leading-6 text-slate-700">{option.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="block space-y-2">
          <span className="text-sm font-bold text-slate-700">件名 <span className="text-slate-400">(任意)</span></span>
          <input
            name="subject"
            type="text"
            value={values.subject}
            onChange={(event) => updateValue("subject", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[#247fc1] focus:ring-4 focus:ring-[#247fc1]/10"
            placeholder="例: ログイン画面の表示について"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-bold text-slate-700">お問い合わせ内容 <span className="text-rose-500">*</span></span>
          <textarea
            name="content"
            required
            rows={7}
            value={values.content}
            onChange={(event) => updateValue("content", event.target.value)}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[#247fc1] focus:ring-4 focus:ring-[#247fc1]/10"
            placeholder="困っていること、追加してほしい機能、気になった点などを入力してください。"
          />
        </label>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <label className="flex-1 space-y-2">
              <span className="text-sm font-bold text-slate-700">学籍番号</span>
              <input
                name="studentNumber"
                type="text"
                required={!values.isAnonymous}
                value={values.isAnonymous ? "匿名" : values.studentNumber}
                onChange={(event) => updateValue("studentNumber", event.target.value)}
                disabled={values.isAnonymous}
                inputMode="numeric"
                autoComplete="off"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-[#247fc1] focus:ring-4 focus:ring-[#247fc1]/10"
                placeholder="例: 1234567"
              />
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-sm sm:min-w-[180px] sm:justify-center">
              <input
                name="isAnonymous"
                type="checkbox"
                checked={values.isAnonymous}
                onChange={(event) => updateValue("isAnonymous", event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#247fc1] focus:ring-[#247fc1]"
              />
              <span className="text-sm font-semibold text-slate-700">匿名で送信する</span>
            </label>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            匿名を選ぶと学籍番号欄は無効になります。匿名でない場合は学籍番号を入力してください。
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            必須項目はお問い合わせ種別とお問い合わせ内容です。
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#247fc1] to-[#2fa6b2] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(36,127,193,0.24)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? '送信中...' : '送信する'}
          </button>
        </div>
      </div>
    </form>
  );
}