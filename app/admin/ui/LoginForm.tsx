"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    loginAction,
    { ok: true }
  );

  return (
    <main className="flex-1 flex items-center justify-center px-6">
      <form
        action={action}
        className="w-full max-w-sm bg-[var(--box)] border-2 border-[var(--ink)] shadow-[8px_8px_0_var(--ink)] p-8 flex flex-col gap-4"
      >
        <h1 className="text-2xl font-black text-center mb-2">ניהול · Admin</h1>

        <label className="flex flex-col gap-1 font-bold text-sm">
          שם משתמש
          <input
            name="user"
            required
            autoComplete="username"
            className="border-2 border-[var(--ink)] bg-white px-3 py-3 text-base font-normal"
          />
        </label>

        <label className="flex flex-col gap-1 font-bold text-sm">
          סיסמה
          <input
            name="pass"
            type="password"
            required
            autoComplete="current-password"
            className="border-2 border-[var(--ink)] bg-white px-3 py-3 text-base font-normal"
          />
        </label>

        {state.error && (
          <p role="alert" className="text-red-700 text-sm font-bold">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 bg-[var(--ink)] text-[var(--box)] py-3 font-black text-lg disabled:opacity-50 cursor-pointer"
        >
          {pending ? "רק רגע…" : "כניסה"}
        </button>
      </form>
    </main>
  );
}
