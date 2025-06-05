import '@/styles/globals.css'
import "@/lib/firebase"
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
