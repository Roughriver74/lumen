export default function Header() {
  return (
    <header className="bg-black/90 backdrop-blur-xl text-white p-6 text-center shadow-2xl">
      <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-lumen-orange to-lumen-yellow bg-clip-text text-transparent">
        🎸 LUMEN TOUR MAP 🎸
      </h1>
      <p className="text-lg opacity-90">
        Интерактивная карта концертов группы Lumen
      </p>
    </header>
  )
}