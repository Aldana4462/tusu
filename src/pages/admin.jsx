// src/pages/admin.jsx
import { useEffect, useState } from "react";
import { db, serverTimestamp } from "../lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  addDoc
} from "firebase/firestore";

export default function AdminPage() {
  const [preguntas, setPreguntas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Pide contraseña al cargar la página
    const pwd = prompt("Contraseña de administrador:");
    if (pwd !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      alert("Contraseña incorrecta. Serás redirigido.");
      window.location.href = "/";
      return;
    }

    // Listener en tiempo real a “preguntas_crudas”
    const q = query(
      collection(db, "preguntas_crudas"),
      orderBy("fecha", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const arr = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setPreguntas(arr);
      setCargando(false);
    });

    return () => unsub();
  }, []);

  const aprobar = async (item) => {
    // Copia a “preguntas_publicas” con la misma fecha
    await addDoc(collection(db, "preguntas_publicas"), {
      texto: item.texto,
      fecha: item.fecha || serverTimestamp()
    });
    // Borra del crudo
    await deleteDoc(doc(db, "preguntas_crudas", item.id));
  };

  const rechazar = async (id) => {
    await deleteDoc(doc(db, "preguntas_crudas", id));
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <p className="text-[#f5f5f5]">Cargando preguntas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Panel de Moderación</h1>
      {preguntas.length === 0 && (
        <p>No hay preguntas pendientes.</p>
      )}
      <div className="grid gap-4">
        {preguntas.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800 p-4 rounded-2xl shadow-md flex flex-col"
          >
            <p className="mb-2">{item.texto}</p>
            <div className="flex gap-2">
              <button
                onClick={() => aprobar(item)}
                className="px-4 py-2 bg-green-600 rounded-lg text-sm hover:bg-green-700 transition"
              >
                Aprobar
              </button>
              <button
                onClick={() => rechazar(item.id)}
                className="px-4 py-2 bg-red-600 rounded-lg text-sm hover:bg-red-700 transition"
              >
                Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
