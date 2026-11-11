import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function ContactModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const msg = message.trim();
    if (!msg || msg.length > 2000 || name.length > 100) return;
    setState("sending");
    const { error } = await supabase.from("contact_messages").insert({ name: name.trim(), message: msg, sender_id: user?.id ?? null });
    setState(error ? "error" : "sent");
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4" role="dialog" aria-label="Contact" onClick={onClose}>
      <form onSubmit={send} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
        <h2 className="m-0 text-lg font-semibold">Contact</h2>
        {state === "sent" ? (
          <p className="m-0 text-sm text-muted-foreground">Sent! Thanks for reaching out.</p>
        ) : (
          <>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="Your name (optional)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none" />
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} required rows={5} placeholder="Message, bug report, or game request…" className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none resize-none" />
            {state === "error" && <p role="alert" className="m-0 text-xs text-destructive">Could not send. Try again.</p>}
          </>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-border px-4 py-1.5 text-sm">Close</button>
          {state !== "sent" && <button type="submit" disabled={state === "sending"} className="rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-sm">{state === "sending" ? "Sending…" : "Send"}</button>}
        </div>
      </form>
    </div>
  );
}

type Row = { id: string; name: string; message: string; created_at: string };

export function ContactInbox() {
  const { user } = useAuth();
  const [admin, setAdmin] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
   if (user?.email === "junejuneeditz@gmail.com") {
  setAdmin(true);
  
      if (!data) return;
      setAdmin(true);
      supabase.from("contact_messages").select("id,name,message,created_at").order("created_at", { ascending: false }).then(({ data: r }) => setRows((r as Row[]) ?? []));
    });
  }, [user]);

  if (!admin) return null;
  const remove = async (id: string) => {
    await supabase.from("contact_messages").delete().eq("id", id);
    setRows((r) => r.filter((x) => x.id !== id));
  };

  return (
    <section className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-lg font-semibold mb-3">Inbox · Contact requests ({rows.length})</h2>
      {rows.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
      <ul className="flex flex-col gap-2 p-0 m-0 list-none">
        {rows.map((r) => (
          <li key={r.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{r.name || "Anonymous"} · {new Date(r.created_at).toLocaleString()}</span>
              <button onClick={() => remove(r.id)} className="hover:text-foreground">Delete</button>
            </div>
            <p className="m-0 text-sm whitespace-pre-wrap">{r.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
