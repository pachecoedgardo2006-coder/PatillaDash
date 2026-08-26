using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PatillaDash.Application.DTOs.Productos;
using PatillaDash.Application.Interfaces;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Interfaces;

namespace PatillaDash.Application.Services;

public class ProductoService : IProductoService
{
    private readonly IProductoRepository _productoRepository;

    public ProductoService(IProductoRepository productoRepository)
    {
        _productoRepository = productoRepository;
    }

    public async Task<IEnumerable<ProductoDto>> ObtenerTodosAsync(bool? soloActivos = null)
    {
        var productos = await _productoRepository.GetAllAsync(soloActivos);
        return productos.Select(p => new ProductoDto(
            p.Id,
            p.Nombre,
            p.PrecioBase,
            p.Categoria,
            p.Activo
        ));
    }

    public async Task<ProductoDto?> ObtenerPorIdAsync(int id)
    {
        var p = await _productoRepository.GetByIdAsync(id);
        if (p == null) return null;

        return new ProductoDto(p.Id, p.Nombre, p.PrecioBase, p.Categoria, p.Activo);
    }

    public async Task<ProductoDto> CrearProductoAsync(CrearProductoDto dto)
    {
        var nuevo = new Producto(dto.Nombre, dto.PrecioBase, dto.Categoria, true);
        await _productoRepository.AddAsync(nuevo);

        return new ProductoDto(nuevo.Id, nuevo.Nombre, nuevo.PrecioBase, nuevo.Categoria, nuevo.Activo);
    }

    public async Task<ProductoDto> ActualizarProductoAsync(int id, ActualizarProductoDto dto)
    {
        var producto = await _productoRepository.GetByIdAsync(id);
        if (producto == null)
        {
            throw new KeyNotFoundException($"El producto #{id} no existe.");
        }

        producto.Actualizar(dto.Nombre, dto.PrecioBase, dto.Categoria, dto.Activo);
        await _productoRepository.UpdateAsync(producto);

        return new ProductoDto(producto.Id, producto.Nombre, producto.PrecioBase, producto.Categoria, producto.Activo);
    }

    public async Task<ProductoDto> ToggleActivoAsync(int id)
    {
        var producto = await _productoRepository.GetByIdAsync(id);
        if (producto == null)
        {
            throw new KeyNotFoundException($"El producto #{id} no existe.");
        }

        producto.ToggleActivo();
        await _productoRepository.UpdateAsync(producto);

        return new ProductoDto(producto.Id, producto.Nombre, producto.PrecioBase, producto.Categoria, producto.Activo);
    }
}
