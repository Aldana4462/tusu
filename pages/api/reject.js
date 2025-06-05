// pages/api/reject.js
import { db } from "../../lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "ID faltante" });
  }
  try {
    await deleteDoc(doc(db, "preguntas_crudas", id));
    return res.status(200).json({ message: "Pregunta rechazada" });
  } catch (error) {
    console.error("Error al rechazar pregunta:", error);
    return res.status(500).json({ error: "Error interno" });
  }
}
