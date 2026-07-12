import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const requestResourceDownload = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      resourceId: z.string().uuid(),
      email: z.string().email().max(320),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Use a publishable-key client so the anon INSERT policy validates the email
    const supabaseAnon = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } }
    );

    const { data: res, error: lookupErr } = await supabaseAnon
      .from("resources")
      .select("file_path, published")
      .eq("id", data.resourceId)
      .maybeSingle();

    if (lookupErr || !res || !res.published) {
      return { ok: false as const, error: "Recurso no disponible." };
    }
    if (!res.file_path) {
      return { ok: false as const, error: "Este recurso todavía no tiene archivo." };
    }

    // Record the lead (subject to the anon INSERT policy with email validation)
    const { error: insertErr } = await supabaseAnon
      .from("resource_downloads")
      .insert({ resource_id: data.resourceId, email: data.email });
    if (insertErr) {
      return { ok: false as const, error: "No pudimos registrar tu correo." };
    }

    // Generate a short-lived signed URL (1 hour) with the admin client
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("resource-files")
      .createSignedUrl(res.file_path, 60 * 60);
    if (signErr || !signed) {
      return { ok: false as const, error: "No pudimos generar el enlace." };
    }

    return { ok: true as const, url: signed.signedUrl };
  });
