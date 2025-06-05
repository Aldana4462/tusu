import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import AdminList from '@/components/AdminList'
import { useRouter } from 'next/router'

export default function Admin() {
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const pass = prompt('Contrase\u00f1a admin:')
    if (pass === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthorized(true)
    } else {
      router.replace('/')
    }
  }, [router])

  if (!authorized) return null

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl mb-4">Panel de administraci\u00f3n</h1>
      <AdminList />
    </div>
  )
}
