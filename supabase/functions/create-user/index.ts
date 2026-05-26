import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const callerToken = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!callerToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: { user: caller }, error: callerError } = await supabaseAdmin.auth.getUser(callerToken);
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("role")
      .eq("id", caller.id)
      .maybeSingle();

    if (profileError) {
      return new Response(JSON.stringify({ error: "Profile lookup failed: " + profileError.message }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!callerProfile) {
      return new Response(JSON.stringify({ error: "Profile not found for user: " + caller.id }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (callerProfile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden: caller role is " + callerProfile.role }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { email, password, display_name, role } = await req.json();

    if (!email || !password || !display_name) {
      return new Response(JSON.stringify({ error: "email, password, and display_name are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const validRoles = ["staff", "executive", "jsp_admin", "admin"];
    const assignedRole = validRoles.includes(role) ? role : "staff";

    const result = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name, role: assignedRole },
    });

    const createError = result.error;
    const newUser = result.data;

    if (createError) {
      return new Response(JSON.stringify({
        error: createError.message,
        debug: {
          status: createError.status,
          name: createError.name,
          code: (createError as any).code,
        }
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!newUser?.user) {
      return new Response(JSON.stringify({
        error: "No user returned from Supabase",
        debug: { data: JSON.stringify(newUser) }
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: profile, error: profileInsertError } = await supabaseAdmin
      .from("user_profiles")
      .select("id")
      .eq("id", newUser.user.id)
      .maybeSingle();

    if (!profile) {
      await supabaseAdmin.from("user_profiles").insert({
        id: newUser.user.id,
        email: newUser.user.email,
        display_name,
        role: assignedRole,
      });
    }

    return new Response(JSON.stringify({ user: newUser.user }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
