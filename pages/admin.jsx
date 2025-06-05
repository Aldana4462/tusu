// pages/admin.jsx
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
import PreguntaCard from "../components/PreguntaCard";

export default function AdminPage() {
  const [preguntas, setPreguntas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const pwd = prompt("Contraseña de administrador:");
    if (pwd !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      alert("Contraseña incorrecta. Redirigiendo a inicio.");
      window.location.href = "/";
      return;
    }
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
    await addDoc(collection(db, "preguntas_publicas"), {
      texto: item.texto,
      fecha: item.fecha || serverTimestamp()
    });
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
      {preguntas.length === 0 ? (
        <p>No hay preguntas pendientes.</p>
      ) : (
        <div className="grid gap-4">
          {preguntas.map((item) => (
            <PreguntaCard
              key={item.id}
              texto={item.texto}
              fecha={item.fecha}
              onApprove={() => aprobar(item)}
              onReject={() => rechazar(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
