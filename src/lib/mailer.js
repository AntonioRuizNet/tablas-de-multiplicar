const DEFAULT_FROM = "Tablas de multiplicar <no-reply@tablasdemultiplicar.app>";

export async function sendPasswordResetEmail({ to, recoveryUrl }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;

  if (!apiKey) {
    console.error("Recovery email not sent: RESEND_API_KEY is not configured.");
    return { ok: false, error: "missing_api_key" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Recupera el acceso a tu cuenta",
        html: `<p>Has solicitado recuperar el acceso a tu cuenta.</p><p><a href="${recoveryUrl}">Entrar en mi cuenta</a></p><p>El enlace solo puede utilizarse una vez y caduca en 30 minutos. Después de entrar podrás cambiar tu contraseña desde tu perfil.</p>`,
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("Resend recovery email failed:", {
        status: response.status,
        error: payload,
      });
      return { ok: false, status: response.status, error: payload };
    }

    console.info("Recovery email accepted by Resend:", payload?.id || "no-id");
    return { ok: true, id: payload?.id || null };
  } catch (error) {
    console.error("Resend recovery email request failed:", error);
    return { ok: false, error: "request_failed" };
  }
}
