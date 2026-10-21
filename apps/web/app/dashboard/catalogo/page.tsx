"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import {
  RotateCcw,
  Trash2,
  Package,
  Scissors,
  Plus,
  Sparkles,
  Inbox,
  AlertCircle,
  Tag,
  Clock,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

interface ServicioItem {
  id: string;
  nombre: string;
  duracion: number;
  precio: number;
}

interface ProductoItem {
  id: string;
  nombre: string;
  stock: number;
  precio: number;
}

interface PapeleraItem {
  id: string;
  originalId: string;
  nombre: string;
  tipo: "servicio" | "producto";
  precio: number;
  duracion?: number;
  stock?: number;
  deletedAt: string;
}

export default function CatalogoPage() {
  const { user, token } = useAuth();
  const businessId = user?.tenantId;

  const [activeTab, setActiveTab] = useState<"servicios" | "productos" | "papelera">("servicios");
  const [loading, setLoading] = useState(false);

  const [servicios, setServicios] = useState<ServicioItem[]>([]);
  const [productos, setProductos] = useState<ProductoItem[]>([]);
  const [papelera, setPapelera] = useState<PapeleraItem[]>([]);

  // Modales de creación/edición
  const [showServicioModal, setShowServicioModal] = useState(false);
  const [showProductoModal, setShowProductoModal] = useState(false);
  const [servicioFormData, setServicioFormData] = useState({ nombre: "", duracion: 30, precio: 0 });
  const [productoFormData, setProductoFormData] = useState({ nombre: "", stock: 0, precio: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Modales de Confirmación de Borrado
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    tipo: "servicio" | "producto";
    nombre: string;
  } | null>(null);

  const [itemToPermanentDelete, setItemToPermanentDelete] = useState<PapeleraItem | null>(null);

  // Toast feedback
  const [notification, setNotification] = useState<string | null>(null);
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const [servRes, prodRes] = await Promise.allSettled([
        apiFetch<any[]>(`/services?businessId=${businessId}`, {
          token: token || undefined,
        }).catch(() => apiFetch<any[]>(`/services/public?businessId=${businessId}`)),
        apiFetch<any[]>(`/products?businessId=${businessId}`, {
          token: token || undefined,
        }).catch(() => apiFetch<any[]>(`/products/public?businessId=${businessId}`)),
      ]);

      if (servRes.status === "fulfilled" && Array.isArray(servRes.value)) {
        setServicios(
          servRes.value.map((s) => ({
            id: String(s.id),
            nombre: s.name,
            duracion: Number(s.duration) || 30,
            precio: Number(s.price) || 0,
          })),
        );
      }

      if (prodRes.status === "fulfilled" && Array.isArray(prodRes.value)) {
        setProductos(
          prodRes.value.map((p) => ({
            id: String(p.id),
            nombre: p.name,
            stock: Number(p.stock) || 0,
            precio: Number(p.price) || 0,
          })),
        );
      }
    } catch (err) {
      console.error("Error loading catalogo data:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- SERVICIOS ---
  const handleOpenServicioModal = (servicio?: ServicioItem) => {
    if (servicio) {
      setServicioFormData(servicio);
      setEditingId(servicio.id);
    } else {
      setServicioFormData({ nombre: "", duracion: 30, precio: 0 });
      setEditingId(null);
    }
    setShowServicioModal(true);
  };

  const handleSaveServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      triggerNotification("Error: No se encontró identificador de negocio.");
      return;
    }
    try {
      if (editingId) {
        await apiFetch(`/services/${editingId}`, {
          method: "PATCH",
          token: token || undefined,
          body: JSON.stringify({
            name: servicioFormData.nombre,
            duration: Number(servicioFormData.duracion),
            price: Number(servicioFormData.precio),
          }),
        });
        triggerNotification("Servicio actualizado con éxito.");
      } else {
        await apiFetch("/services", {
          method: "POST",
          token: token || undefined,
          body: JSON.stringify({
            name: servicioFormData.nombre,
            duration: Number(servicioFormData.duracion),
            price: Number(servicioFormData.precio),
            businessId,
          }),
        });
        triggerNotification("Nuevo servicio añadido al catálogo.");
      }
      setShowServicioModal(false);
      await loadData();
    } catch (err: any) {
      console.error("Error saving servicio:", err);
      triggerNotification(err.message || "Error al guardar el servicio.");
    }
  };

  // --- PRODUCTOS ---
  const handleOpenProductoModal = (producto?: ProductoItem) => {
    if (producto) {
      setProductoFormData(producto);
      setEditingId(producto.id);
    } else {
      setProductoFormData({ nombre: "", stock: 0, precio: 0 });
      setEditingId(null);
    }
    setShowProductoModal(true);
  };

  const handleSaveProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      triggerNotification("Error: No se encontró identificador de negocio.");
      return;
    }
    try {
      if (editingId) {
        await apiFetch(`/products/${editingId}`, {
          method: "PATCH",
          token: token || undefined,
          body: JSON.stringify({
            name: productoFormData.nombre,
            stock: Number(productoFormData.stock),
            price: Number(productoFormData.precio),
          }),
        });
        triggerNotification("Producto actualizado con éxito.");
      } else {
        await apiFetch("/products", {
          method: "POST",
          token: token || undefined,
          body: JSON.stringify({
            name: productoFormData.nombre,
            stock: Number(productoFormData.stock),
            price: Number(productoFormData.precio),
            businessId,
          }),
        });
        triggerNotification("Nuevo producto añadido al inventario.");
      }
      setShowProductoModal(false);
      await loadData();
    } catch (err: any) {
      console.error("Error saving producto:", err);
      triggerNotification(err.message || "Error al guardar el producto.");
    }
  };

  // --- SOFT DELETE INTERCEPTION ---
  const handleRequestSoftDelete = (id: string, tipo: "servicio" | "producto", nombre: string) => {
    setItemToDelete({ id, tipo, nombre });
  };

  const handleConfirmSoftDelete = () => {
    if (!itemToDelete) return;

    const nowStr = new Date().toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });

    if (itemToDelete.tipo === "servicio") {
      const serv = servicios.find((s) => s.id === itemToDelete.id);
      if (serv) {
        setServicios((prev) => prev.filter((s) => s.id !== itemToDelete.id));
        setPapelera((prev) => [
          ...prev,
          {
            id: `del-${Date.now()}`,
            originalId: serv.id,
            nombre: serv.nombre,
            tipo: "servicio",
            precio: serv.precio,
            duracion: serv.duracion,
            deletedAt: nowStr,
          },
        ]);
      }
    } else {
      const prod = productos.find((p) => p.id === itemToDelete.id);
      if (prod) {
        setProductos((prev) => prev.filter((p) => p.id !== itemToDelete.id));
        setPapelera((prev) => [
          ...prev,
          {
            id: `del-${Date.now()}`,
            originalId: prod.id,
            nombre: prod.nombre,
            tipo: "producto",
            precio: prod.precio,
            stock: prod.stock,
            deletedAt: nowStr,
          },
        ]);
      }
    }

    triggerNotification(`"${itemToDelete.nombre}" ha sido movido a la Papelera.`);
    setItemToDelete(null);
  };

  // --- PAPELERA ACTIONS ---
  const handleRestoreFromPapelera = (item: PapeleraItem) => {
    setPapelera((prev) => prev.filter((p) => p.id !== item.id));

    if (item.tipo === "servicio") {
      setServicios((prev) => [
        ...prev,
        {
          id: item.originalId,
          nombre: item.nombre,
          duracion: item.duracion || 30,
          precio: item.precio,
        },
      ]);
      triggerNotification(`Servicio "${item.nombre}" restaurado al catálogo.`);
    } else {
      setProductos((prev) => [
        ...prev,
        {
          id: item.originalId,
          nombre: item.nombre,
          stock: item.stock || 0,
          precio: item.precio,
        },
      ]);
      triggerNotification(`Producto "${item.nombre}" restaurado al inventario.`);
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!itemToPermanentDelete) return;
    try {
      if (itemToPermanentDelete.tipo === "servicio") {
        await apiFetch(`/services/${itemToPermanentDelete.originalId}`, {
          method: "DELETE",
          token: token || undefined,
        });
      } else {
        await apiFetch(`/products/${itemToPermanentDelete.originalId}`, {
          method: "DELETE",
          token: token || undefined,
        });
      }
      setPapelera((prev) => prev.filter((p) => p.id !== itemToPermanentDelete.id));
      triggerNotification(`"${itemToPermanentDelete.nombre}" eliminado definitivamente.`);
      await loadData();
    } catch (err: any) {
      console.error("Error deleting item:", err);
      triggerNotification(err.message || "Error al eliminar definitivamente.");
    } finally {
      setItemToPermanentDelete(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Catálogo y Stock</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Administra tus prestaciones de servicios profesionales y productos de venta al público.
          </p>
        </div>

        {activeTab !== "papelera" && (
          <button
            onClick={() =>
              activeTab === "servicios" ? handleOpenServicioModal() : handleOpenProductoModal()
            }
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm shadow-blue-600/20 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar {activeTab === "servicios" ? "Servicio" : "Producto"}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "servicios"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
          onClick={() => setActiveTab("servicios")}
        >
          <Scissors className="w-4 h-4" />
          <span>Servicios</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 ml-1">
            {servicios.length}
          </span>
        </button>

        <button
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "productos"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
          onClick={() => setActiveTab("productos")}
        >
          <Package className="w-4 h-4" />
          <span>Productos</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 ml-1">
            {productos.length}
          </span>
        </button>

        <button
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "papelera"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
          onClick={() => setActiveTab("papelera")}
        >
          <Trash2 className="w-4 h-4" />
          <span>Papelera de Reciclaje</span>
          {papelera.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 ml-1 font-bold">
              {papelera.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {activeTab === "servicios" && (
          <div>
            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm">Cargando servicios...</p>
              </div>
            ) : servicios.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Scissors className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-3" />
                <p className="font-medium text-slate-600">No hay servicios registrados</p>
                <p className="text-sm text-slate-400 mt-1">
                  Agrega los servicios que ofreces a tus clientes para habilitar reservas.
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/75">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Duración
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {servicios.map((servicio) => (
                    <tr key={servicio.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                            <Scissors className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            {servicio.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {servicio.duracion} min
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                        ${servicio.precio.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleOpenServicioModal(servicio)}
                          className="text-blue-600 hover:text-blue-800 font-medium mr-4 transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() =>
                            handleRequestSoftDelete(servicio.id, "servicio", servicio.nombre)
                          }
                          className="text-rose-600 hover:text-rose-800 font-medium transition"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "productos" && (
          <div>
            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm">Cargando productos...</p>
              </div>
            ) : productos.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Package className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-3" />
                <p className="font-medium text-slate-600">No hay productos en inventario</p>
                <p className="text-sm text-slate-400 mt-1">
                  Registra productos de venta al público en el mostrador.
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/75">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {productos.map((producto) => (
                    <tr key={producto.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                            <Package className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            {producto.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                            producto.stock > 0
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {producto.stock > 0 ? `${producto.stock} unidades` : "Agotado"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                        ${producto.precio.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleOpenProductoModal(producto)}
                          className="text-blue-600 hover:text-blue-800 font-medium mr-4 transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() =>
                            handleRequestSoftDelete(producto.id, "producto", producto.nombre)
                          }
                          className="text-rose-600 hover:text-rose-800 font-medium transition"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Papelera de Reciclaje */}
        {activeTab === "papelera" && (
          <div>
            {papelera.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Inbox className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-3" />
                <p className="font-medium text-slate-600">La papelera está vacía</p>
                <p className="text-sm text-slate-400 mt-1">
                  Los servicios y productos que elimines aparecerán aquí temporalmente para que
                  puedas recuperarlos si es necesario.
                </p>
              </div>
            ) : (
              <div>
                <div className="p-4 bg-amber-50/70 border-b border-amber-200/60 flex items-center gap-3 text-amber-800 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Los elementos en la papelera no se muestran a los clientes ni en la agenda.
                    Puedes restaurarlos a su pestaña original en cualquier momento o eliminarlos
                    permanentemente.
                  </span>
                </div>
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/75">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Elemento
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Fecha Eliminado
                      </th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {papelera.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-slate-900 line-through text-slate-500">
                            {item.nombre}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              item.tipo === "servicio"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            <Tag className="w-3 h-3" />
                            {item.tipo === "servicio" ? "Servicio" : "Producto"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                          ${item.precio.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                          {item.deletedAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleRestoreFromPapelera(item)}
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold mr-4 transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restaurar</span>
                          </button>
                          <button
                            onClick={() => setItemToPermanentDelete(item)}
                            className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-800 font-semibold transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar definitivo</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Confirmar Soft Delete (Mover a Papelera) */}
      <ConfirmDeleteModal
        isOpen={Boolean(itemToDelete)}
        title={`¿Mover "${itemToDelete?.nombre}" a la papelera?`}
        description="El elemento ya no estará visible en la agenda pública ni en tu catálogo activo, pero podrás restaurarlo en cualquier momento desde la pestaña Papelera."
        confirmText="Mover a papelera"
        cancelText="Cancelar"
        isDestructive={false}
        onConfirm={handleConfirmSoftDelete}
        onCancel={() => setItemToDelete(null)}
      />

      {/* Modal Confirmar Borrado Permanente */}
      <ConfirmDeleteModal
        isOpen={Boolean(itemToPermanentDelete)}
        title={`¿Eliminar definitivamente "${itemToPermanentDelete?.nombre}"?`}
        description="Esta acción es irreversible y eliminará permanentemente el registro de la base de datos sin posibilidad de recuperación."
        confirmText="Eliminar para siempre"
        cancelText="Cancelar"
        isDestructive={true}
        onConfirm={handleConfirmPermanentDelete}
        onCancel={() => setItemToPermanentDelete(null)}
      />

      {/* Modal Servicio */}
      {showServicioModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingId ? "Editar Servicio" : "Nuevo Servicio"}
            </h3>
            <form onSubmit={handleSaveServicio} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nombre</label>
                <input
                  type="text"
                  required
                  value={servicioFormData.nombre}
                  onChange={(e) =>
                    setServicioFormData({ ...servicioFormData, nombre: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  required
                  min="5"
                  step="5"
                  value={servicioFormData.duracion}
                  onChange={(e) =>
                    setServicioFormData({ ...servicioFormData, duracion: Number(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Precio</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={servicioFormData.precio}
                  onChange={(e) =>
                    setServicioFormData({ ...servicioFormData, precio: Number(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowServicioModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold transition shadow-sm shadow-blue-600/20"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Producto */}
      {showProductoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingId ? "Editar Producto" : "Nuevo Producto"}
            </h3>
            <form onSubmit={handleSaveProducto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nombre</label>
                <input
                  type="text"
                  required
                  value={productoFormData.nombre}
                  onChange={(e) =>
                    setProductoFormData({ ...productoFormData, nombre: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Stock (unidades)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={productoFormData.stock}
                  onChange={(e) =>
                    setProductoFormData({ ...productoFormData, stock: Number(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Precio</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={productoFormData.precio}
                  onChange={(e) =>
                    setProductoFormData({ ...productoFormData, precio: Number(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductoModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold transition shadow-sm shadow-blue-600/20"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
