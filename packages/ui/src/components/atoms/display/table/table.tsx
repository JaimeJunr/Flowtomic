import type * as React from "react";
import { cn } from "@/lib/utils";

// Type definitions
export type TableProps = React.ComponentProps<"table">;
export type TableHeaderProps = React.ComponentProps<"thead">;
export type TableBodyProps = React.ComponentProps<"tbody">;
export type TableFooterProps = React.ComponentProps<"tfoot">;
export type TableRowProps = React.ComponentProps<"tr">;
export type TableHeadProps = React.ComponentProps<"th">;
export type TableCellProps = React.ComponentProps<"td">;
export type TableCaptionProps = React.ComponentProps<"caption">;

/**
 * Table - Container principal da tabela
 */
function Table({ className, ...props }: TableProps) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}
Table.displayName = "Table";

/**
 * TableHeader - Cabeçalho da tabela
 */
function TableHeader({ className, ...props }: TableHeaderProps) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />;
}
TableHeader.displayName = "TableHeader";

/**
 * TableBody - Corpo da tabela
 */
function TableBody({ className, ...props }: TableBodyProps) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}
TableBody.displayName = "TableBody";

/**
 * TableFooter - Rodapé da tabela
 */
function TableFooter({ className, ...props }: TableFooterProps) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  );
}
TableFooter.displayName = "TableFooter";

/**
 * TableRow - Linha da tabela
 */
function TableRow({ className, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  );
}
TableRow.displayName = "TableRow";

/**
 * TableHead - Cabeçalho de célula
 */
function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  );
}
TableHead.displayName = "TableHead";

/**
 * TableCell - Célula da tabela
 */
function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  );
}
TableCell.displayName = "TableCell";

/**
 * TableCaption - Legenda da tabela
 */
function TableCaption({ className, ...props }: TableCaptionProps) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
