import { useEffect, useState } from 'react'
import PreguntaCard from '@/components/PreguntaCard'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'

export default function Feed() {
  const [preguntas, setPreguntas] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'preguntas_publicas'), orderBy('fecha', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setPreguntas(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="mb-4 text-center">
        <Link href="/" className="text-acento underline">Volver</Link>
      </div>
      {preguntas.map((p) => (
        <PreguntaCard key={p.id} texto={p.texto} fecha={p.fecha} />
      ))}
    </div>
  )
}
