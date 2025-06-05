import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const q = query(collection(db, 'preguntas_raw'), orderBy('fecha', 'desc'))
  const snap = await getDocs(q)
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  res.status(200).json(data)
}
