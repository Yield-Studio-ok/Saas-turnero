"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  PackageCheck,
  Search,
} from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

export interface CounterProduct {
  id: string;
  name: string;
  price: number;
  available: boolean; // Only available or out of stock! No numeric units or margins
  category?: string;
}

export interface CounterSale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  paymentMethod: "efectivo" | "tarjeta" | "transferencia";
  clientName?: string;
  timestamp: string;
  employeeName?: string;
}

const defaultProducts: CounterProduct[] = [
  {
    id: "prod_1",
    name: "Shampoo Profesional Anti-caída (300ml)",
    price: 2500,
    available: true,
    category: "Cuidado Capilar",
  },
  {
    id: "prod_2",
    name: "Cera Modeladora Efecto Mate",
    price: 1800,
    available: true,
    category: "Peinado",
  },
  {
    id: "prod_3",
    name: "Aceite Nutritivo para Barba (50ml)",
    price: 2200,
    available: true,
    category: "Barbería",
  },
  {
    id: "prod_4",
    name: "Pomada Fijación Extra Fuerte",
    price: 2100,
    available: false,
    category: "Peinado",
  },
  {
    id: "prod_5",
    name: "Loción After Shave Refrescante",
    price: 1600,
    available: true,
    category: "Barbería",
  },
  {
    id: "prod_6",
    name: "Gel Exfoliante Facial Masculino",
    price: 1950,
    available: false,
    category: "Cuidado Facial",
  },
  {
    id: "prod_7",
    name: "Peine Profesional de Carbono",
    price: 950,
    available: true,
    category: "Accesorios",
  },
];

export function EmpleadoVentas({ employeeName = "Juan Pérez" }: { employeeName?: string }) {
  const { user, token } = useAuth();
  const businessId = user?.tenantId || "";
  const employeeId = user?.uid || "";

  const [products, setProducts] = useState<CounterProduct[]>(defaultProducts);
  const [selectedProductId, setSelectedProductId] = useState<string>(defaultProducts[0]?.id || "");
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta" | "transferencia">(
    "efectivo",
  );
  const [clientName, setClientName] = useState<string>(" ");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [salesHistory, setSalesHistory] = useState<CounterSale[]>([]);
  const [loadingSales, setLoadingSales] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;

  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [lastSaleReceipt, setLastSaleReceipt] = useState<CounterSale | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // 1. Fetch real products if businessId is available
      try {
        if (businessId) {
          const apiProducts = await apiFetch<any[]>(`/products/public?businessId=${businessId}`);
          if (isMounted && Array.isArray(apiProducts) && apiProducts.length > 0) {
            const mapped = apiProducts.map((p) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              available: (p.stock ?? 0) > 0,
              category: p.description || "General",
            }));
            setProducts(mapped);
            if (mapped[0]) setSelectedProductId(mapped[0].id);
          }
        }
      } catch (err) {
        console.warn("Using default products fallback", err);
      }

      // 2. Fetch shift sales from API
      try {
        if (employeeId && token) {
          const query = businessId
            ? `/products/sales/shift?employeeId=${employeeId}&businessId=${businessId}`
            : `/products/sales/shift?employeeId=${employeeId}`;
          const shiftSales = await apiFetch<any[]>(query, { token });
          if (isMounted && Array.isArray(shiftSales)) {
            setSalesHistory(
              shiftSales.map((s) => ({
                id: s.id,
                productId: s.productId,
                productName: s.product?.name || "Producto",
                quantity: s.quantity,
                unitPrice: s.unitPrice,
                total: s.total,
                paymentMethod: (s.paymentMethod as any) || "efectivo",
                clientName: s.clientName || undefined,
                timestamp: new Date(s.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                employeeName: s.employee?.name || employeeName,
              })),
            );
          }
        }
      } catch (err) {
        console.warn("Could not load shift sales from API", err);
      } finally {
        if (isMounted) setLoadingSales(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [businessId, employeeId, token, employeeName]);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleRegisterSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!selectedProduct.available) {
      alert("El producto seleccionado se encuentra 'Sin stock'. No es posible registrar la venta.");
      return;
    }

    const total = selectedProduct.price * quantity;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    try {
      let createdId = "sale_" + Date.now();

      if (token && businessId && employeeId) {
        const payload = {
          productId: selectedProduct.id,
          businessId,
          employeeId,
          quantity,
          unitPrice: selectedProduct.price,
          total,
          paymentMethod,
          clientName: clientName.trim() || undefined,
        };

        const response = await apiFetch<any>("/products/sales", {
          method: "POST",
          body: JSON.stringify(payload),
          token,
        });
        if (response?.id) {
          createdId = response.id;
        }
      }

      const newSale: CounterSale = {
        id: createdId,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        unitPrice: selectedProduct.price,
        total,
        paymentMethod,
        clientName: clientName.trim() || "Cliente de Mostrador",
        timestamp: timeStr,
        employeeName,
      };

      setSalesHistory((prev) => [newSale, ...prev]);
      setCurrentPage(1);
      setLastSaleReceipt(newSale);
      setSuccessToast(`¡Venta registrada con éxito! Total: $${total.toLocaleString("es-AR")}`);

      setClientName("");
      setQuantity(1);

      setTimeout(() => {
        setSuccessToast(null);
      }, 4000);
    } catch (err: any) {
      alert(`Error al registrar la venta: ${err?.message || "Error de conexión"}`);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const totalShiftSales = salesHistory.reduce((acc, s) => acc + s.total, 0);
  const totalShiftItems = salesHistory.reduce((acc, s) => acc + s.quantity, 0);

  const totalPages = Math.max(1, Math.ceil(salesHistory.length / ITEMS_PER_PAGE));
  const paginatedSales = salesHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-8">
      {/* Shift Overview Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                Venta Rápida de Mostrador
              </h1>
            </div>
            <p className="text-blue-200 text-sm mt-1">
              Registro inmediato de productos adicionales vendidos por el personal de atención.
            </p>
          </div>
          <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10">
            <div>
              <p className="text-xs uppercase tracking-wider text-blue-200">Total en Turno</p>
              <p className="text-2xl font-bold text-white">
                ${totalShiftSales.toLocaleString("es-AR")}
              </p>
            </div>
            <div className="border-l border-white/20 pl-6">
              <p className="text-xs uppercase tracking-wider text-blue-200">Productos</p>
              <p className="text-2xl font-bold text-emerald-400">{totalShiftItems}</p>
            </div>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold">{successToast}</p>
          </div>
          {lastSaleReceipt && (
            <button
              onClick={() => setLastSaleReceipt(null)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
            >
              Cerrar
            </button>
          )}
        </div>
      )}

      {/* Main Grid: Form + Product Quick Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              <span>Registrar Venta</span>
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">
              Vendedor: {employeeName}
            </span>
          </div>

          <form onSubmit={handleRegisterSale} className="space-y-5">
            {/* Product Select */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Producto de Mostrador
              </label>
              <CustomSelect
                value={selectedProductId}
                onChange={(val) => setSelectedProductId(val as string)}
                options={products.map((p) => ({
                  value: p.id,
                  label: `${p.name} ($${p.price.toLocaleString("es-AR")}) - ${p.available ? "Disponible" : "Sin stock"}`,
                  disabled: !p.available,
                }))}
              />
              {/* Product Stock Badge Preview */}
              {selectedProduct && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-600">
                    <span className="font-medium text-slate-800">{selectedProduct.name}</span>
                    <p className="text-slate-500 mt-0.5">
                      ${selectedProduct.price.toLocaleString("es-AR")} c/u
                    </p>
                  </div>
                  <div>
                    {selectedProduct.available ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        Disponible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Sin stock
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Cantidad</label>
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center py-2.5 text-sm font-bold text-slate-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Total a Cobrar
                </label>
                <div className="h-[46px] flex items-center justify-center bg-blue-50 border border-blue-200 rounded-xl text-blue-900 font-extrabold text-lg">
                  $
                  {selectedProduct
                    ? (selectedProduct.price * quantity).toLocaleString("es-AR")
                    : "0"}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Método de Cobro
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("efectivo")}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    paymentMethod === "efectivo"
                      ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs ring-1 ring-blue-600"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <Banknote className="w-4 h-4 mb-1" />
                  Efectivo
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("tarjeta")}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    paymentMethod === "tarjeta"
                      ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs ring-1 ring-blue-600"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-1" />
                  Tarjeta
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("transferencia")}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    paymentMethod === "transferencia"
                      ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs ring-1 ring-blue-600"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <Smartphone className="w-4 h-4 mb-1" />
                  Transferencia
                </button>
              </div>
            </div>

            {/* Client Name (Optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Cliente o Turno Relacionado{" "}
                <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Lucas Romero / Turno 15:30"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedProduct || !selectedProduct.available}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <PackageCheck className="w-5 h-5" />
              <span>Registrar Venta de Mostrador</span>
            </button>
          </form>
        </div>

        {/* Catalog List Column: Only Shows Available / Out of Stock (No Numeric Stock, No Margins) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Catálogo de Mostrador</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Haz clic en un producto para cargarlo en el formulario de venta inmediata.
                </p>
              </div>
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto custom-scrollbar">
              {filteredProducts.map((p) => {
                const isSelected = selectedProductId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (p.available) {
                        setSelectedProductId(p.id);
                      }
                    }}
                    className={`py-3 px-3 rounded-xl flex items-center justify-between transition ${
                      isSelected
                        ? "bg-blue-50/80 border border-blue-200"
                        : p.available
                          ? "hover:bg-slate-50 cursor-pointer"
                          : "opacity-60 bg-slate-50/50 cursor-not-allowed"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                        {p.category && (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {p.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-blue-600">
                        ${p.price.toLocaleString("es-AR")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Availability Badge: Only Verde (Disponible) or Rojo (Sin stock) */}
                      {p.available ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Disponible
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          Sin stock
                        </span>
                      )}

                      {p.available && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProductId(p.id);
                          }}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white"
                          }`}
                        >
                          {isSelected ? "Seleccionado" : "Elegir"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shift Sales History */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-500" />
                <span>Ventas del Turno Registradas ({salesHistory.length})</span>
              </h3>
              {loadingSales && (
                <span className="text-xs text-slate-400 animate-pulse">Cargando ventas...</span>
              )}
            </div>

            {salesHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Aún no has registrado ventas en este turno.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b">
                      <tr>
                        <th className="py-2.5 px-3">Hora</th>
                        <th className="py-2.5 px-3">Producto</th>
                        <th className="py-2.5 px-3">Cant.</th>
                        <th className="py-2.5 px-3">Total</th>
                        <th className="py-2.5 px-3">Pago</th>
                        <th className="py-2.5 px-3">Cliente</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {paginatedSales.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-medium text-slate-500">{s.timestamp}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {s.productName}
                          </td>
                          <td className="py-2.5 px-3 font-medium">{s.quantity}</td>
                          <td className="py-2.5 px-3 font-bold text-blue-600">
                            ${s.total.toLocaleString("es-AR")}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {s.paymentMethod}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 truncate max-w-[120px]">
                            {s.clientName || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls (10 items per page) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Página <span className="font-semibold text-slate-700">{currentPage}</span> de{" "}
                    <span className="font-semibold text-slate-700">{totalPages}</span> (Total:{" "}
                    <span className="font-semibold text-slate-700">{salesHistory.length}</span>{" "}
                    ventas)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmpleadoVentas;
