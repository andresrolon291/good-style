This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Panel admin con Supabase

El panel esta en `/admin`. Para que productos y promos se vean desde cualquier dispositivo:

1. Crea un proyecto en Supabase.
2. Ejecuta el contenido de `supabase.sql` en el SQL editor de Supabase.
3. Copia `.env.example` a `.env.local` y completa:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_USER`
   - `ADMIN_PASS`
4. En Vercel, carga esas mismas variables en Project Settings > Environment Variables.
5. Entra a `/admin`, inicia sesion y usa `Importar catalogo base` una sola vez para cargar los productos actuales.

La tienda lee el catalogo desde `/api/catalog`. Si Supabase no esta configurado, muestra el catalogo base para que la pagina no quede vacia.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
