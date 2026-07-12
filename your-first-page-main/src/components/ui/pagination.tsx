import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="paginación"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-0", className)} {...props} />
  ),
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("", className)} {...props} />,
);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({ className, isActive, size = "icon", ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: "ghost",
        size,
      }),
      "hover:bg-transparent transition-opacity duration-300 font-normal",
      isActive 
        ? "underline underline-offset-8 opacity-30 pointer-events-none" 
        : "opacity-60 hover:opacity-100",
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

interface PaginationNavProps extends React.ComponentProps<typeof PaginationLink> {
  currentPage?: number;
  totalPages?: number;
}

const PaginationPrevious = ({
  className,
  currentPage,
  totalPages,
  ...props
}: PaginationNavProps) => {
  if (totalPages !== undefined && totalPages < 3) return null;
  if (currentPage === 1) return null;
  return (
    <PaginationLink
      aria-label="Ir a la página anterior"
      size="default"
      className={cn("gap-1 pl-2.5", className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Anterior</span>
    </PaginationLink>
  );
};
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  currentPage,
  totalPages,
  ...props
}: PaginationNavProps) => {
  if (totalPages !== undefined && totalPages < 3) return null;
  if (currentPage !== undefined && totalPages !== undefined && currentPage === totalPages) return null;
  return (
    <PaginationLink
      aria-label="Ir a la página siguiente"
      size="default"
      className={cn("gap-1 pr-2.5", className)}
      {...props}
    >
      <span>Siguiente</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  );
};
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center opacity-60", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">Más páginas</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

interface PaginationPagesProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const PaginationPages = ({ currentPage, totalPages, setCurrentPage }: PaginationPagesProps) => {
  if (totalPages <= 7) {
    return (
      <>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              isActive={currentPage === page}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
      </>
    );
  }

  const pages: (number | string)[] = [];
  if (currentPage <= 4) {
    pages.push(1, 2, 3, 4, 5, "...", totalPages);
  } else if (currentPage >= totalPages - 3) {
    pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
  }

  return (
    <>
      {pages.map((page, i) => (
        <PaginationItem key={i}>
          {page === "..." ? (
            <PaginationEllipsis />
          ) : (
            <PaginationLink
              isActive={currentPage === page}
              onClick={() => setCurrentPage(page as number)}
            >
              {page}
            </PaginationLink>
          )}
        </PaginationItem>
      ))}
    </>
  );
};
PaginationPages.displayName = "PaginationPages";

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationPages,
};