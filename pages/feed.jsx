// pages/feed.jsx
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import PreguntaCard from "../components/PreguntaCard";

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
          <PreguntaCard
            key={item.id}
            texto={item.texto}
            fecha={item.fecha}
          />
        ))}
      </div>
    </div>
  );
}
