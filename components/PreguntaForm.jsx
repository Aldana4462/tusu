// components/PreguntaForm.jsx
import { useState } from "react";

export default function PreguntaForm({ onSubmit }) {
  const [texto, setTexto] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(texto);
        setTexto("");
      }}
      className="w-full max-w-lg flex flex-col"
    >
      <textarea
        className="w-full h-32 p-4 border-4 border-red-600 bg-gray-900 text-white placeholder-gray-400 rounded-xl focus:outline-none resize-none"
        placeholder="Escribe tu pregunta aquí..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        required
      />
      <button
        type="submit"
        className="mt-4 w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
      >
        Enviar pregunta
      </button>
    </form>
  );
}
