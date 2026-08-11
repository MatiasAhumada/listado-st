"use client";

import { useState } from "react";
import { Pencil, Smartphone, UsersRound } from "lucide-react";
import { AddMobileDeviceForm } from "@/components/technician/AddMobileDeviceForm";
import { WorkshopCustomerForm } from "@/components/technician/WorkshopCustomerForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WORKSHOP_OPERATIONS_TEXT } from "@/constants/workshopOperations.constant";
import { WorkshopCustomerSummary } from "@/interfaces/workshopOperations.interface";

interface WorkshopCustomerManagerProps {
  customers: WorkshopCustomerSummary[];
  onCreated: (customer: WorkshopCustomerSummary) => void;
  onUpdated: (customer: WorkshopCustomerSummary) => void;
}

export function WorkshopCustomerManager({ customers, onCreated, onUpdated }: WorkshopCustomerManagerProps) {
  const [editingCustomer, setEditingCustomer] = useState<WorkshopCustomerSummary>();

  const handleSaved = (customer: WorkshopCustomerSummary) => {
    if (editingCustomer) {
      onUpdated(customer);
      setEditingCustomer(undefined);
      return;
    }
    onCreated(customer);
  };

  return (
    <section className="grid items-start gap-6 xl:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.65fr)]">
      <div className="flex flex-col gap-6 xl:sticky xl:top-6">
        <Card className="border-foreground/15 bg-card/95 shadow-lg">
          <CardHeader>
            <CardTitle className="font-display text-2xl uppercase tracking-wide">
              {editingCustomer
                ? WORKSHOP_OPERATIONS_TEXT.editCustomerTitle
                : WORKSHOP_OPERATIONS_TEXT.createCustomerTitle}
            </CardTitle>
            <CardDescription>{WORKSHOP_OPERATIONS_TEXT.createCustomerDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <WorkshopCustomerForm
              key={editingCustomer?.id ?? "new-customer"}
              customer={editingCustomer}
              onSaved={handleSaved}
              onCancel={editingCustomer ? () => setEditingCustomer(undefined) : undefined}
            />
          </CardContent>
        </Card>

        {customers.length ? (
          <Card className="border-foreground/15 bg-card/95 shadow-lg">
            <CardHeader>
              <CardTitle className="font-display text-2xl uppercase tracking-wide">
                {WORKSHOP_OPERATIONS_TEXT.addDeviceTitle}
              </CardTitle>
              <CardDescription>{WORKSHOP_OPERATIONS_TEXT.customersDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <AddMobileDeviceForm customers={customers} onSaved={onUpdated} />
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card className="min-w-0 border-foreground/15 bg-card/95 shadow-lg">
        <CardHeader>
          <CardTitle className="font-display text-2xl uppercase tracking-wide">
            {WORKSHOP_OPERATIONS_TEXT.customersListTitle}
          </CardTitle>
          <CardDescription>{WORKSHOP_OPERATIONS_TEXT.customersListDescription}</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          {customers.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{WORKSHOP_OPERATIONS_TEXT.customerNameLabel}</TableHead>
                  <TableHead>{WORKSHOP_OPERATIONS_TEXT.customerPhoneLabel}</TableHead>
                  <TableHead>{WORKSHOP_OPERATIONS_TEXT.deviceModelLabel}</TableHead>
                  <TableHead>{WORKSHOP_OPERATIONS_TEXT.quotesTab}</TableHead>
                  <TableHead className="text-right">{WORKSHOP_OPERATIONS_TEXT.actionsColumn}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex min-w-44 flex-col gap-1">
                        <strong>{customer.fullName}</strong>
                        {customer.email ? (
                          <span className="text-xs text-muted-foreground">{customer.email}</span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>
                      <div className="flex min-w-52 flex-col gap-2">
                        {customer.devices.map((device) => (
                          <div key={device.id} className="flex items-center gap-2">
                            <Badge variant="outline">
                              <Smartphone />
                              {device.brand} {device.model}
                            </Badge>
                            {device.imei ? (
                              <span className="font-mono text-xs text-muted-foreground">{device.imei}</span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{customer.quoteCount}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setEditingCustomer(customer)}>
                        <Pencil data-icon="inline-start" />
                        {WORKSHOP_OPERATIONS_TEXT.editAction}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty className="min-h-72 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UsersRound />
                </EmptyMedia>
                <EmptyTitle>{WORKSHOP_OPERATIONS_TEXT.emptyCustomers}</EmptyTitle>
                <EmptyDescription>{WORKSHOP_OPERATIONS_TEXT.createCustomerDescription}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
