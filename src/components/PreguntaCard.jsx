export default function PreguntaCard({ texto, fecha }) {
  const date = fecha?.seconds ? new Date(fecha.seconds * 1000) : new Date()
  const formatted = date.toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="bg-gray-800 rounded-2xl shadow p-4 mb-4">
      <p className="font-mono whitespace-pre-wrap">{texto}</p>
      <div className="text-sm text-gray-400 mt-2">{formatted}</div>
    </div>
  )
}
