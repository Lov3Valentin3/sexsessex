"use client";
import { useState } from "react";
import { BrandMark } from "@/components/magic";
import { api } from "@/lib/client-api";
type Mode = "parent-login" | "parent-register" | "kid" | "admin";
export function AuthScreen({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const action =
        mode === "parent-login"
          ? "login-parent"
          : mode === "parent-register"
            ? "register-parent"
            : mode === "admin"
              ? "login-admin"
              : "login-kid";
      const data = await api<{ next?: string }>("/api/auth", {
        action,
        email,
        password,
        name,
        firstName,
        secretCode,
      });
      window.location.href = data.next || "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in.");
      setBusy(false);
    }
  }
  const title =
    mode === "parent-login"
      ? "Parent Login"
      : mode === "parent-register"
        ? "Parent Register"
        : mode === "admin"
          ? "Workshop Admin"
          : "Kid Login";
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-16">
      <BrandMark large />
      <form onSubmit={submit} className="panel gold-border mt-8 p-6">
        <h1 className="font-display text-3xl text-np-gold">{title}</h1>
        <p className="mt-2 text-sm text-np-cream/70">
          {mode === "kid"
            ? "Type your first name and the secret code a grown-up gave you."
            : "Welcome back to Santa’s workshop gate."}
        </p>
        {mode === "kid" ? (
          <>
            <label className="mt-5 block text-sm font-bold">First name</label>
            <input className="kid-input mt-1" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <label className="mt-4 block text-sm font-bold">Secret code</label>
            <input className="kid-input mt-1 uppercase" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} required />
          </>
        ) : (
          <>
            {mode === "parent-register" ? (
              <>
                <label className="mt-5 block text-sm font-bold">Your name</label>
                <input className="input-dark mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
              </>
            ) : null}
            <label className="mt-4 block text-sm font-bold">Email</label>
            <input className="input-dark mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <label className="mt-4 block text-sm font-bold">Password</label>
            <input className="input-dark mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </>
        )}
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        <button className="magic-btn mt-6 w-full" disabled={busy} type="submit">
          {busy ? "Sprinkling snow…" : "Enter the workshop"}
        </button>
        {mode === "parent-login" ? (
          <p className="mt-4 text-sm">
            New family? <a href="/parent/register">Register here</a>
          </p>
        ) : null}
        {mode === "parent-register" ? (
          <p className="mt-4 text-sm">
            Already have a pass? <a href="/parent/login">Parent login</a>
          </p>
        ) : null}
      </form>
      <p className="mt-6 text-xs text-np-cream/55">
        Demo: parent@northpole.app / ChristmasMagic! · kid Emma / SNOWFLAKE · admin@northpole.app / MagicAdmin2026!
      </p>
    </main>
  );
}
