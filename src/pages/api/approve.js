import { db } from '@/lib/firebase'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { id, texto, fecha } = req.body
  if (!id || !texto) return res.status(400).json({ error: 'Datos faltantes' })
  await setDoc(doc(db, 'preguntas_publicas', id), { texto, fecha })
  await deleteDoc(doc(db, 'preguntas_raw', id))
  res.status(200).json({ ok: true })
}
