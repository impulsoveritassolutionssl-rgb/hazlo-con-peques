# Hazlo con Peques

Plataforma B2B + B2C para organización de eventos infantiles.

## Stack

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Totalum (BaaS)
- **Auth:** Better Auth
- **Pagos:** Stripe
- **Despliegue:** Cloudflare Pages

## Estructura

```
/src
  /app           # Rutas de Next.js
  /components    # Componentes React
  /lib           # Utilidades y SDKs
  /types         # Tipos TypeScript
```

## Desarrollo

```bash
npm install
npm run dev
```

## Producción

El despliegue es automático vía GitHub Actions → Cloudflare Pages.

## Variables de Entorno

- `TOTALUM_API_KEY` - API key de Totalum
- `BETTER_AUTH_SECRET` - Secret para auth
- `NEXT_PUBLIC_APP_URL` - URL pública de la app

## Licencia

Privado - Impulso Veritas Solutions SL
