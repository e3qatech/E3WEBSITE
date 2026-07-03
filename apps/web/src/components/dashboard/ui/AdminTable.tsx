import * as React from "react"
import { cn } from "@/lib/utils"

const AdminTable = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto bg-surface-default border border-border-default rounded-xl shadow-sm">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
)
AdminTable.displayName = "AdminTable"

const AdminTableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b [&_tr]:border-border-default bg-surface-active", className)} {...props} />
  )
)
AdminTableHeader.displayName = "AdminTableHeader"

const AdminTableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-0 divide-y divide-border-default", className)}
      {...props}
    />
  )
)
AdminTableBody.displayName = "AdminTableBody"

const AdminTableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn("border-t border-border-default bg-surface-active font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  )
)
AdminTableFooter.displayName = "AdminTableFooter"

const AdminTableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-border-default transition-colors hover:bg-surface-hover data-[state=selected]:bg-surface-active",
        className
      )}
      {...props}
    />
  )
)
AdminTableRow.displayName = "AdminTableRow"

const AdminTableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle font-bold text-text-secondary text-xs uppercase tracking-wider [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
)
AdminTableHead.displayName = "AdminTableHead"

const AdminTableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn("p-4 align-middle text-text-primary [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
)
AdminTableCell.displayName = "AdminTableCell"

const AdminTableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn("mt-4 text-sm text-text-tertiary", className)}
      {...props}
    />
  )
)
AdminTableCaption.displayName = "AdminTableCaption"

export {
  AdminTable,
  AdminTableHeader,
  AdminTableBody,
  AdminTableFooter,
  AdminTableHead,
  AdminTableRow,
  AdminTableCell,
  AdminTableCaption,
}
