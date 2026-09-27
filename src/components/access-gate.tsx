"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function AccessGate() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await axios.post("/api/access", { key });
      router.refresh();
    } catch {
      setError("Invalid access key.");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl p-6 ring-1 ring-foreground/10"
      >
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-lg">Presales Call Prep Agent</h1>
          <p className="text-muted-foreground text-sm">
            This demo runs on the owner's API key. Enter the access key to continue.
          </p>
        </div>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="access-key">Access key</FieldLabel>
          <Input
            id="access-key"
            type="password"
            autoComplete="off"
            autoFocus
            required
            value={key}
            onChange={(event) => setKey(event.target.value)}
            aria-invalid={Boolean(error)}
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>
        <Button type="submit" disabled={submitting || key.length === 0}>
          Continue
        </Button>
      </form>
    </main>
  );
}
