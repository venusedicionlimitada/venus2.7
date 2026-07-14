import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationPages,
} from "@/components/ui/pagination";

export function PaginationControl({ currentPage, totalPages, setCurrentPage }: { 
  currentPage: number, 
  totalPages: number, 
  setCurrentPage: (p: number) => void 
}) {
  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-12 cursor-pointer">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious currentPage={currentPage} totalPages={totalPages} onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} />
        </PaginationItem>
        <PaginationPages currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
        <PaginationItem>
          <PaginationNext currentPage={currentPage} totalPages={totalPages} onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}