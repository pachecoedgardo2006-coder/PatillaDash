namespace PatillaDash.Domain.Entities;

public class Local
{
    private readonly List<Usuario> _usuarios = new();
    private readonly List<InventarioLocal> _inventarios = new();

    public int Id { get; private set; }
    public string Nombre { get; private set; } = string.Empty;
    public string Direccion { get; private set; } = string.Empty;
    public bool Activo { get; private set; }

    public IReadOnlyCollection<Usuario> Usuarios => _usuarios.AsReadOnly();
    public IReadOnlyCollection<InventarioLocal> Inventarios => _inventarios.AsReadOnly();

    private Local() { }

    public Local(string nombre, string direccion)
    {
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("El nombre del local es obligatorio.");

        Nombre = nombre;
        Direccion = direccion;
        Activo = true;
    }

    public void DesactivarLocal() => Activo = false;
    public void ActivarLocal() => Activo = true;
}