"use client";

import { useState } from "react";
import Link from "next/link";
import { serviceTypesList } from "@/config/service-types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { Eye } from "lucide-react";

export function ServiceTypesTable() {
  const [search, setSearch] = useState("");

  const filtered = serviceTypesList.filter((item) => {
    return (
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Service Types</h1>
        <p className="text-sm text-muted-foreground">
          Static definitions of services configured directly in code. These definitions are read-only.
        </p>
      </div>

      {/* Filter and search block */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search service types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md w-full"
          />
        </div>
      </div>

      {/* Grid or Table display */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse table-fixed">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[58%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead>
                <tr className="bg-muted/50 border-b border-border h-11 text-[11px] font-semibold text-muted-foreground tracking-wider">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Description
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[13px] text-foreground">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-muted-foreground font-medium"
                    >
                      No service types found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3.5 max-w-0 font-semibold text-foreground">
                        {item.name}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {item.description}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/backoffice/services/types/preview/${item.id}`}
                          className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                          title={`Preview ${item.name} Form`}
                        >
                          <Eye className="size-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
