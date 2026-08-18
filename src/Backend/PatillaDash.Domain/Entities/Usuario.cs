using PatillaDash.Domain.Enums;

namespace PatillaDash.Domain.Entities;

public class Usuario
{
    public int Id { get; private set; }
    public string Nombre { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public RolUsuario Rol { get; private set; }
    public int? LocalId { get; private set; }

    public Local? Local { get; private set; }

    // Constructor privado para EF Core
    private Usuario() { }

    public Usuario(string nombre, string email, string passwordHash, RolUsuario rol, int? localId = null)
    {
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("El nombre es obligatorio.");
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("El email es obligatorio.");
        if (rol == RolUsuario.Vendedor && !localId.HasValue) 
            throw new InvalidOperationException("Un vendedor debe estar asignado a un local.");

        Nombre = nombre;
        Email = email;
        PasswordHash = passwordHash;
        Rol = rol;
        LocalId = localId;
    }

    public void AsignarLocal(int localId)
    {
        if (Rol != RolUsuario.Vendedor)
            throw new InvalidOperationException("Solo los vendedores requieren asignación explícita de local.");
        
        LocalId = localId;
    }

    public void ActualizarPassword(string nuevoPasswordHash)
    {
        if (string.IsNullOrWhiteSpace(nuevoPasswordHash)) 
            throw new ArgumentException("La contraseña no puede estar vacía.");

        PasswordHash = nuevoPasswordHash;
    }
}