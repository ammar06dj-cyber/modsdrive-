-- ====================================================================
-- تفعيل سياسات الحماية على مستوى الصفوف (Row-Level Security - RLS)
-- لجدول المودات "mods" لحظر التعديل أو الحذف من النطاق الخارجي (العميل)
-- ====================================================================

-- 1. التأكد من تمكين RLS على الجدول
ALTER TABLE mods ENABLE ROW LEVEL SECURITY;

-- 2. إزالة أي سياسات سابقة لتفادي التكرار والتعارض
DROP POLICY IF EXISTS "Allow public read access for approved mods" ON mods;
DROP POLICY IF EXISTS "Block anon and client write requests" ON mods;
DROP POLICY IF EXISTS "Allow service role full administrative access" ON mods;

-- 3. سياسة القراءة العامة المسموحة للزوار وعامة المستخدمين:
-- يستطيع أي مستخدم قراءة المودات المعتمدة (approved) أو المودات التي لا تمتلك حالة معينة (NULL)
CREATE POLICY "Allow public read access for approved mods" 
ON mods
FOR SELECT
USING (
  status IS NULL OR 
  status = 'approved'
);

-- 4. سياسة منع الاستدعاءات الخارجية العشوائية (الإدراج، التعديل، والحذف) من المتصفح:
-- لا يحق للمفتاح العام للـ Client (anon role) القيام بعمليات الإضافة أو التعديل أو الحذف.
-- بما أننا قمنا بتمكين الـ RLS ولم نمنح أي سياسات INSERT/UPDATE/DELETE لـ anon، 
-- فإن Supabase سيحظرها تلقائياً بالكامل.

-- 5. تفعيل الصلاحية الكاملة للعمليات الخلفية (Service Role):
-- السيرفر يدير جدول المودات عبر استدعاءات آمنة باستخدام SUPABASE_SERVICE_ROLE_KEY.
-- لتسهيل العمل لمدير النظام عبر السيرفر، يمتلك الـ service_role حق الوصول الكامل لجميع العمليات.
-- ملاحظة: في PostgreSQL وسياسات Supabase، يتخطى مفتاح الـ service_role جميع سياسات RLS افتراضياً.
-- لكن لتأكيد ذلك برمجياً، نمنح صلاحيات كاملة له:
CREATE POLICY "Allow service role full administrative access"
ON mods
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
