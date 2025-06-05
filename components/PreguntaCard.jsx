// components/PreguntaCard.jsx
export default function PreguntaCard({ texto, fecha, onApprove, onReject }) {
  return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow-md flex flex-col">
      <p className="mb-2 text-white">{texto}</p>
      {fecha && (
        <span className="text-sm text-[#7e3af2] mb-2">
          {fecha?.toDate
            ? fecha.toDate().toLocaleString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </span>
      )}
      {(onApprove || onReject) && (
        <div className="flex gap-2 mt-2">
          {onApprove && (
            <button
              onClick={onApprove}
              className="px-4 py-2 bg-green-600 rounded-lg text-sm hover:bg-green-700 transition"
            >
              Aprobar
            </button>
          )}
          {onReject && (
            <button
              onClick={onReject}
              className="px-4 py-2 bg-red-600 rounded-lg text-sm hover:bg-red-700 transition"
            >
              Rechazar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
