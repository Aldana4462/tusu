import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function AdminList() {
  const [preguntas, setPreguntas] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'preguntas_raw'), orderBy('fecha', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setPreguntas(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  const aprobar = async (p) => {
    await fetch('/api/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    })
  }

  const rechazar = async (id) => {
    await fetch('/api/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  return (
    <div className="space-y-4">
      {preguntas.map((p) => (
        <div key={p.id} className="bg-gray-800 p-4 rounded-2xl shadow">
          <p className="font-mono whitespace-pre-wrap mb-2">{p.texto}</p>
          <div className="flex gap-2">
            <button onClick={() => aprobar(p)} className="bg-acento px-3 py-1 rounded text-texto">Aprobar</button>
            <button onClick={() => rechazar(p.id)} className="bg-rojo px-3 py-1 rounded text-texto">Rechazar</button>
          </div>
        </div>
      ))}
    </div>
  )
}
