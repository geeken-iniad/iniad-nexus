import { createClient } from "@/utils/supabase/server";

export default async function CalendarData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
