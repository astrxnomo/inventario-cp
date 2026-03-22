import { CabinetsTable } from "@/components/admin/cabinets/table"
import { getCabinetsWithCounts } from "@/lib/data/cabinets/get-cabinets"

export default async function AdminCabinetsPage() {
  const cabinets = await getCabinetsWithCounts()

  return (
    <main id="main-content" className="w-full px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gabinetes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {cabinets.length} gabinete{cabinets.length !== 1 ? "s" : ""} en el
            sistema
          </p>
        </div>
      </div>

      <div className="mx-auto">
        <CabinetsTable data={cabinets} />
      </div>
    </main>
  )
}
