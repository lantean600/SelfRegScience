"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "注册失败");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell title="注册" subtitle="创建你的自控协议档案">
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
            autoComplete="new-password"
            required
          />
        </Field>
        {error && (
          <Alert variant="danger" className="mt-4">
            {error}
          </Alert>
        )}
        <Button type="submit" className="w-full mt-6">
          注册
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        <Link href="/login">已有账号</Link>
      </p>
    </AuthShell>
  );
}
