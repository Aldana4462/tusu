import { db } from '@/lib/firebase'
import { doc, deleteDoc } from 'firebase/firestore'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { id } = req.body
  if (!id) return res.status(400).json({ error: 'ID requerido' })
  await deleteDoc(doc(db, 'preguntas_raw', id))
  res.status(200).json({ ok: true })
}
