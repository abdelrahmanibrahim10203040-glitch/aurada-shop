# خطوات التشغيل (مرة واحدة)
1. npm i -g wrangler  ثم  wrangler login
2. wrangler d1 create aurada-db   (انسخي database_id وحطيه في wrangler.toml)
3. wrangler r2 bucket create aurada-images
4. wrangler d1 execute aurada-db --remote --file=schema.sql
5. wrangler d1 execute aurada-db --remote --file=seed.sql
6. wrangler pages deploy . --project-name=auradashop
7. من لوحة Cloudflare: Workers & Pages > auradashop > Settings > Variables and Secrets، أضيفي Secrets:
   ADMIN_PASSWORD = كلمة سر قوية للعميلة
   SESSION_SECRET = أي نص عشوائي طويل
   ثم أعيدي النشر (الخطوة 6) عشان تتفعل.
8. صفحة الإدارة: auradashop.pages.dev/admin
