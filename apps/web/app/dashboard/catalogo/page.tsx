"use client";
import { useState } from "react";

const initialServicios = [
  { id: 1, nombre: "Corte Clásico", duracion: 30, precio: 1500 },
  { id: 2, nombre: "Coloración", duracion: 120, precio: 5000 },
];

const initialProductos = [
  { id: 1, nombre: "Shampoo Profesional", stock: 10, precio: 2500 },
  { id: 2, nombre: "Cera Modeladora", stock: 5, precio: 1800 },
];

export default function CatalogoPage() {
  const [activeTab, setActiveTab] = useState<"servicios" | "productos">("servicios");

  const [servicios, setServicios] = useState(initialServicios);
  const [productos, setProductos] = useState(initialProductos);

  const [showServicioModal, setShowServicioModal] = useState(false);
  const [showProductoModal, setShowProductoModal] = useState(false);

  const [servicioFormData, setServicioFormData] = useState({ nombre: "", duracion: 30, precio: 0 });
  const [productoFormData, setProductoFormData] = useState({ nombre: "", stock: 0, precio: 0 });

  const [editingId, setEditingId] = useState<number | null>(null);

  // --- SERVICIOS ---
  const handleOpenServicioModal = (servicio?: any) => {
    if (servicio) {
      setServicioFormData(servicio);
      setEditingId(servicio.id);
    } else {
      setServicioFormData({ nombre: "", duracion: 30, precio: 0 });
      setEditingId(null);
    }
    setShowServicioModal(true);
  };

  const handleSaveServicio = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setServicios(
        servicios.map((serv) => (serv.id === editingId ? { ...servicioFormData, id: editingId } : serv)),
      );
    } else {
      setServicios([...servicios, { ...servicioFormData, id: Date.now() }]);
    }
    setShowServicioModal(false);
  };

  const handleDeleteServicio = (id: number) => {
    setServicios(servicios.filter((serv) => serv.id !== id));
  };

  // --- PRODUCTOS ---
  const handleOpenProductoModal = (producto?: any) => {
    if (producto) {
      setProductoFormData(producto);
      setEditingId(producto.id);
    } else {
      setProductoFormData({ nombre: "", stock: 0, precio: 0 });
      setEditingId(null);
    }
    setShowProductoModal(true);
  };

  const handleSaveProducto = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setProductos(
        productos.map((prod) => (prod.id === editingId ? { ...productoFormData, id: editingId } : prod)),
      );
    } else {
      setProductos([...productos, { ...productoFormData, id: Date.now() }]);
    }
    setShowProductoModal(false);
  };

  const handleDeleteProducto = (id: number) => {
    setProductos(productos.filter((prod) => prod.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Catálogo y Stock</h2>
        <button
          onClick={() => (activeTab === "servicios" ? handleOpenServicioModal() : handleOpenProductoModal())}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Agregar {activeTab === "servicios" ? "Servicio" : "Producto"}
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          className={`py-2 px-4 ${activeTab === "servicios" ? "border-b-2 border-blue-600 font-bold text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("servicios")}
        >
          Servicios
        </button>
        <button
          className={`py-2 px-4 ${activeTab === "productos" ? "border-b-2 border-blue-600 font-bold text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("productos")}
        >
          Productos
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {activeTab === "servicios" ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración (min)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {servicios.map((servicio) => (
                <tr key={servicio.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {servicio.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {servicio.duracion} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${servicio.precio}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenServicioModal(servicio)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteServicio(servicio.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {producto.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {producto.stock} uds.
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${producto.precio}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenProductoModal(producto)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProducto(producto.id)}
                      className="text-red-600 hover:text-red-900"
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

      {/* Modal Servicio */}
      {showServicioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              {editingId ? "Editar Servicio" : "Nuevo Servicio"}
            </h3>
            <form onSubmit={handleSaveServicio} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={servicioFormData.nombre}
                  onChange={(e) => setServicioFormData({ ...servicioFormData, nombre: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  required
                  min="5"
                  step="5"
                  value={servicioFormData.duracion}
                  onChange={(e) => setServicioFormData({ ...servicioFormData, duracion: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={servicioFormData.precio}
                  onChange={(e) => setServicioFormData({ ...servicioFormData, precio: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowServicioModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex/items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              {editingId ? "Editar Producto" : "Nuevo Producto"}
            </h3>
            <form onSubmit={handleSaveProducto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={productoFormData.nombre}
                  onChange={(e) => setProductoFormData({ ...productoFormData, nombre: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stock (unidades)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={productoFormData.stock}
                  onChange={(e) => setProductoFormData({ ...productoFormData, stock: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={productoFormData.precio}
                  onChange={(e) => setProductoFormData({ ...productoFormData, precio: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowProductoModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
