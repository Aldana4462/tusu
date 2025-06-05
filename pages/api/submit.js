// pages/api/submit.js
import { db, serverTimestamp } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }
  const { texto } = req.body;
  if (!texto || !texto.trim()) {
    return res.status(400).json({ error: "Texto vacío" });
  }
  try {
    await addDoc(collection(db, "preguntas_crudas"), {
      texto: texto.trim(),
      fecha: serverTimestamp()
    });
    return res.status(201).json({ message: "Pregunta enviada" });
  } catch (error) {
    console.error("Error al enviar pregunta:", error);
    return res.status(500).json({ error: "Error interno" });
  }
}
