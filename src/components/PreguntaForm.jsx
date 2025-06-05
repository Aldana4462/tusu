import { useState } from 'react'

export default function PreguntaForm() {
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!texto.trim()) return
    setEnviando(true)
    await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto }),
    })
    setTexto('')
    setEnviando(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea
        className="p-3 bg-gray-800 border-4 border-rojo rounded-xl focus:outline-none"
        rows="4"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escribe tu pregunta"/>
      <button
        type="submit"
        disabled={enviando}
        className="bg-rojo hover:bg-red-700 text-texto py-2 rounded font-bold w-full">
        Enviar
      </button>
    </form>
  )
}
