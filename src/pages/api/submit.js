import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { texto } = req.body
  if (!texto) return res.status(400).json({ error: 'Texto requerido' })
  await addDoc(collection(db, 'preguntas_raw'), { texto, fecha: serverTimestamp() })
  res.status(200).json({ ok: true })
}
