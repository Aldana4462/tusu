import PreguntaForm from '@/components/PreguntaForm'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl mb-4">Enviar pregunta anónima</h1>
      <PreguntaForm />
      <div className="mt-8 text-center">
        <Link href="/feed" className="text-acento underline">Ver preguntas publicadas</Link>
      </div>
    </div>
  )
}
