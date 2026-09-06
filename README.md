# Backend AI për Financat e Mia

Ky Cloudflare Worker lexon foton e faturës me OpenAI dhe i kthen aplikacionit vetëm fushat e validuara. Çelësi `OPENAI_API_KEY` ruhet si secret në Cloudflare dhe nuk futet kurrë në `app.js`, GitHub Pages apo backup-in financiar.

## 1. Përgatit konfigurimin

Te `wrangler.jsonc`, kontrollo që `ALLOWED_ORIGINS` të përmbajë origin-in e faqes GitHub Pages:

```text
https://dorielezaj-creator.github.io
```

Përdoret vetëm origin-i, pa `/Financat/` në fund. `http://localhost:8000` mund të mbahet për testimin lokal.

## 2. Instalo dhe hyr në Cloudflare

```bash
npm install
npx wrangler login
```

## 3. Vendos sekretet

```bash
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put APP_ACCESS_TOKEN
```

- Te komanda e parë vendos çelësin e OpenAI API.
- Te e dyta vendos një kod të gjatë, rastësor. Ky është vetëm kodi privat i aplikacionit dhe mund të ndryshohet në çdo kohë.
- Mos i shkruaj sekretet në `wrangler.jsonc`, `.dev.vars.example` ose në skedarët e frontend-it.

## 4. Testo dhe publiko

```bash
npm test
npm run deploy
```

Wrangler do të shfaqë një adresë të ngjashme me:

```text
https://financat-e-mia-ai.dorielezaj.workers.dev
```

## 5. Lidhe me aplikacionin

Adresa e Worker-it është vendosur direkt në frontend:

```html
<meta name="receipt-ai-endpoint" content="https://financat-e-mia-ai.dorielezaj.workers.dev" />
```

Në përdorimin e parë të “Foto fature”, “Shto me AI” ose mikrofonit, aplikacioni kërkon vetëm kodin `APP_ACCESS_TOKEN`. Kodi ruhet lokalisht në pajisjen e përdoruesit.

Butoni “Ndrysho kodin AI” fshin vetëm kodin e ruajtur lokalisht. Në kërkesën tjetër aplikacioni e kërkon përsëri. Adresa e Worker-it nuk ndryshohet nga ky buton.

## Testim lokal opsional

Kopjo `.dev.vars.example` si `.dev.vars`, vendos vlerat reale vetëm në skedarin lokal dhe përdor:

```bash
npm run dev
```

`.dev.vars` është i përjashtuar nga Git dhe nuk duhet publikuar.

## Çfarë kontrollon backend-i

- pranon vetëm origin-et e lejuara;
- kërkon kodin privat kur `APP_ACCESS_TOKEN` është konfiguruar;
- pranon vetëm imazhe JPG, PNG, WebP ose GIF deri në 8 MB;
- i dërgon OpenAI imazhin me `store: false`;
- kërkon përgjigje sipas një JSON Schema strikt;
- normalizon shumën, monedhën, datën, kategorinë dhe nivelin e sigurisë përpara se t’ia kthejë aplikacionit.
