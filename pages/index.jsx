// pages/index.jsx
import { useState } from "react";
import { db, serverTimestamp } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import PreguntaForm from "../components/PreguntaForm";

export default function HomePage() {
  const [enviando, setEnviando] = useState(false);

  const handleEnviar = async (texto) => {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      await addDoc(collection(db, "preguntas_crudas"), {
        texto: texto.trim(),
        fecha: serverTimestamp()
      });
      alert("Pregunta enviada con éxito.");
    } catch (error) {
      console.error("Error al enviar:", error);
      alert("Error al enviar pregunta. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl text-[#f5f5f5] font-bold mb-6">
        Haz tu pregunta anónima
      </h1>
      <PreguntaForm onSubmit={handleEnviar} />
    </div>
  );
}
