import MannequinViewer from "@/components/mannequin-viewer"
import Navbar from "@/components/navbar"

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center pt-16 relative overflow-hidden">
        <MannequinViewer />
      </main>
    </>
  )
}
