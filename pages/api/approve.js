// pages/api/approve.js
import { db, serverTimestamp } from "../../lib/firebase";
import { doc, getDoc, addDoc, collection, deleteDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "ID faltante" });
  }
  try {
    const docRef = doc(db, "preguntas_crudas", id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }
    const data = snapshot.data();
    await addDoc(collection(db, "preguntas_publicas"), {
      texto: data.texto,
      fecha: data.fecha || serverTimestamp()
    });
    await deleteDoc(docRef);
    return res.status(200).json({ message: "Pregunta aprobada" });
  } catch (error) {
    console.error("Error al aprobar pregunta:", error);
    return res.status(500).json({ error: "Error interno" });
  }
}
