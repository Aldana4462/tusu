// src/pages/feed.jsx
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function FeedPage() {
  const [preguntasPub, setPreguntasPub] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "preguntas_publicas"),
      orderBy("fecha", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const arr = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setPreguntasPub(arr);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1a1a] px-4 py-6">
      <h1 className="text-3xl text-[#f5f5f5] font-bold mb-6 text-center">
        Preguntas Publicadas
      </h1>
      <div className="grid gap-4 max-w-2xl mx-auto">
        {preguntasPub.map((item) => (
          <div
            key={item.id}
            className="bg-gray-900 p-4 rounded-2xl shadow-lg"
          >
            <p className="text-white mb-2">{item.texto}</p>
            <span className="text-sm text-[#7e3af2]">
              {item.fecha?.toDate
                ? item.fecha.toDate().toLocaleString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
