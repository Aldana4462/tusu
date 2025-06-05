# TUSU – Web de Preguntas Anónimas

Proyecto Next.js + Tailwind CSS + Firebase para recibir y moderar preguntas anónimas. 

## Scripts disponibles
- `npm run dev`    → Inicia el servidor de desarrollo en http://localhost:3000  
- `npm run build`  → Construye la aplicación en producción  
- `npm run start`  → Corre la aplicación compilada en modo producción  

## Estructura principal
- `pages/`        → Páginas públicas y de administración  
- `components/`   → Componentes React reutilizables  
- `lib/`          → Inicialización de Firebase y utilidades  
- `styles/`       → Estilos globales con Tailwind CSS  
- `firestore.rules` → Reglas de seguridad para Firestore  

## Configuración de Tailwind
Tailwind está configurado en `tailwind.config.js`. Los estilos globales están en `styles/globals.css`.

## Variables de entorno
Copia `.env.local.example` a `.env.local` y llena tus credenciales de Firebase:
NEXT_PUBLIC_FIREBASE_API_KEY=TU_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=TU_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=TU_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=TU_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=TU_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=TU_APP_ID

NEXT_PUBLIC_ADMIN_PASSWORD=UnaClaveDificil123
