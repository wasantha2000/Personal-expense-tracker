# Local development

The frontend and API run as separate processes. Configure `VITE_API_URL` in the
root `.env` (use `http://localhost:5000` for local development) and configure
`DATABASE_URL` and `JWT_SECRET` in `backend/.env`.

Start both processes in separate terminals:

```sh
npm run dev
npm --prefix backend run dev
```

The frontend cannot submit or load data unless the API is running and connected
to the database. Apply `database/schema.sql` to your PostgreSQL database before
using the app.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
