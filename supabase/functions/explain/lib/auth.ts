import { createClient } from "@supabase/supabase-js";
import { SERVICE_ROLE, SUPABASE_URL } from "./config.ts";

/**
 * Get authenticated user from Supabase
 */
export async function getAuthenticatedUser(
  req: Request,
): Promise<{ id: string; email?: string } | null> {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.replace("Bearer ", "");

    // Create Supabase client with the user's JWT token
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Get the authenticated user
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("Failed to get authenticated user:", error);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
    };
  } catch (error) {
    console.error("Failed to authenticate user:", error);
    return null;
  }
}
