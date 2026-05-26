import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const JSP_SYSTEM_PROMPT = `You are the JSP AI Assistant for Justice System Partners (JSP), an organization focused on criminal justice reform. You have deep knowledge of JSP's Organizational Operating System, which is structured around four "Jobs to Be Done":

1. **Thriving Staff** - Developing staff through Employee Investment Plans (EIP), coaching, practice profiles, learning teams, skills databases, and growing towards autonomy.

2. **Trusted Partnerships** - Building relationships through trusted partners, business development, external communications, social media, presentations, communities of practice, relationship management, and CRMC methodology.

3. **System Change (Effectuating Work)** - Delivering projects through a lifecycle: Project Launch → Internal Team → External Kickoff → Calibration Event → Effectuating Work → Closeout & Learning.

4. **Innovative Work** - Pushing the field through cutting-edge research, field-changing initiatives, and challenging the status quo.

JSP's core identity is "Field Catalyst" — connecting these four areas and driving systemic change in criminal justice.

Key concepts:
- EIP: Employee Investment Plan — JSP's staff development framework focused on coaching, north star goals, and practice profiles
- CRMC: JSP's relationship management methodology
- Communities of Practice: Cross-organizational learning communities
- Effectuating Work: The actual project delivery phase
- Field Catalyst: JSP's central identity connecting all four jobs

Be helpful, knowledgeable, and concise. Answer questions about JSP's mission, methodology, tools, and organizational structure.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const openAiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openAiKey) {
      return new Response(
        JSON.stringify({
          response: "The AI Assistant requires an OpenAI API key to be configured. Please ask your admin to add the OPENAI_API_KEY secret to the Supabase Edge Functions settings.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { message, history } = await req.json();

    const messages = [
      { role: "system", content: JSP_SYSTEM_PROMPT },
      ...(history || []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.json();
      throw new Error(errorData.error?.message || "OpenAI API error");
    }

    const data = await openAiResponse.json();
    const response = data.choices?.[0]?.message?.content || "I wasn't able to generate a response. Please try again.";

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
