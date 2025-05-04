/** @format */

import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlusCircle, Pencil, Trash2, FileDown } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Employee } from "@/lib/types";

interface EmployeeTableProps {
  employees: Employee[];
  onDelete: (id: string) => Promise<void>;
}

export default function EmployeeTable({
  employees,
  onDelete,
}: EmployeeTableProps) {
  const columns = [
    {
      key: "id",
      header: "SI",
      cell: (_: Employee, index: number) => index + 1,
      className: "w-14",
    },
    {
      key: "name",
      header: "Name",
      cell: (employee: Employee) => (
        <div className="flex items-center">
          <Avatar className="h-9 w-9 mr-2">
            <AvatarImage
              src={employee.image}
              alt={employee.name}
            />
            <AvatarFallback>{employee.name[0]}</AvatarFallback>
          </Avatar>
          <span>{`${employee.name} `}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      cell: (employee: Employee) => employee.email,
    },
    {
      key: "phone",
      header: "Phone",
      cell: (employee: Employee) => employee.phone,
    },
    {
      key: "role",
      header: "Role",
      cell: (employee: Employee) => {
        const roleMap: Record<string, string> = {
          manager: "Manager",
          chef: "Chef",
          waiter: "Waiter",
          delivery: "Delivery Staff",
          cashier: "Cashier",
        };
        return roleMap[employee.role] || employee.role;
      },
    },
    {
      key: "actions",
      header: "Action",
      cell: (employee: Employee) => (
        <div className="flex space-x-2">
          <Link href={`/employees/edit/${employee.id}`}>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 p-0 bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200 hover:text-blue-700">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 p-0 bg-red-100 text-red-600 border-red-200 hover:bg-red-200 hover:text-red-700"
            onClick={() => onDelete(employee.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <EmptyState
          title="No Employees Found"
          description="There are no employees added yet."
          action={
            <Link href="/employees/add">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Employee
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          Employee List
          <span className="ml-2 bg-gray-200 text-gray-700 text-sm px-2 py-0.5 rounded-full">
            {employees.length}
          </span>
        </h2>
        <div className="flex gap-2">
          <Link href="/employees/add">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Employee
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DataTable
        data={employees}
        columns={columns as []}
        searchPlaceholder="Ex: Search by Employee Name"
        searchKey="firstName"
        className="bg-white p-4 rounded-lg border border-gray-200"
      />
    </div>
  );
}
