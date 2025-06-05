// src/pages/index.jsx
import { useState } from "react";
import { db, serverTimestamp } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function HomePage() {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);

    try {
      await addDoc(collection(db, "preguntas_crudas"), {
        texto: texto.trim(),
        fecha: serverTimestamp()
      });
      setTexto("");
      alert("Pregunta enviada. ¡Gracias!");
    } catch (error) {
      console.error("Error al enviar:", error);
      alert("Hubo un error. Intenta más tarde.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl text-[#f5f5f5] font-bold mb-6">Haz tu pregunta anónima</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg flex flex-col"
      >
        <textarea
          className="w-full h-32 p-4 border-4 border-red-600 bg-gray-900 text-white placeholder-gray-400 rounded-xl focus:outline-none resize-none"
          placeholder="Escribe tu pregunta aquí..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button
          type="submit"
          disabled={enviando}
          className="mt-4 w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-50"
        >
          {enviando ? "Enviando..." : "Enviar pregunta"}
        </button>
      </form>
    </div>
  );
}
