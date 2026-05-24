"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setError("邮箱或密码错误");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell title="登录" subtitle="进入你的实验记录簿">
      <form onSubmit={submit} className="space-y-1">
        <Field label="邮箱">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </Field>
        <Field label="密码">
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
        {error && (
          <Alert variant="danger" className="mt-4">
            {error}
          </Alert>
        )}
        <Button type="submit" className="w-full mt-6">
          登录
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        <Link href="/register">注册新账号</Link>
      </p>
    </AuthShell>
  );
}
