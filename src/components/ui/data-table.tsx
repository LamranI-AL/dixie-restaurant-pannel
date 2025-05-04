/** @format */

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Columns } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  searchPlaceholder?: string;
  searchKey?: string;
  filterOptions?: {
    key: string;
    options: { label: string; value: string }[];
    defaultValue?: string;
  }[];
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = "Search...",
  searchKey,
  filterOptions,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Filter data based on search query and filters
  const filteredData = React.useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchQuery && searchKey) {
      result = result.filter((item) => {
        const value = (item as any)[searchKey]?.toString().toLowerCase();
        return value && value.includes(searchQuery.toLowerCase());
      });
    }

    // Apply other filters
    if (filterOptions && Object.keys(filters).length > 0) {
      result = result.filter((item) => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value || value === "all") return true;
          return (item as any)[key] === value;
        });
      });
    }

    return result;
  }, [data, searchQuery, filters, searchKey]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {searchKey && (
          <div className="flex-1 relative">
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-2 h-5 p-1 rounded bg-gray-200">
              <Search className="h-3 w-3 text-gray-600" />
            </Button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          {filterOptions?.map((filter) => (
            <Select
              key={filter.key}
              defaultValue={filter.defaultValue || "all"}
              onValueChange={(value) => handleFilterChange(filter.key, value)}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 h-10 text-sm font-medium">
            <Columns className="h-4 w-4 mr-1 text-gray-700" />
            Columns
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column) => (
                      <TableCell
                        key={`${rowIndex}-${column.key}`}
                        className={column.className}>
                        {column.cell
                          ? column.cell(row)
                          : (row as any)[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
