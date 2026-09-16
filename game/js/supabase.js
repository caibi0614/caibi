// ===============================
// 🏠 菜比之家 Supabase 連線
// ===============================

const SUPABASE_URL = "https://cxoqymugkaqajxzqfvdi.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_Hnu6s348Zu7mx5pqU68l4g_Wwfd1dcH";

// 建立菜比之家的 Supabase 連線
const caibiSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

console.log("🏠 菜比之家：Supabase 已建立連線");
console.log("🥦 菜比 Supabase 已載入！");
console.log(caibiSupabase);