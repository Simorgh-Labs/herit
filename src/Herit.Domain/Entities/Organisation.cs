namespace Herit.Domain.Entities;

public class Organisation
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = default!;
    public Guid? ParentId { get; private set; }

    private Organisation() { }

    public static Organisation Create(Guid id, string name, Guid? parentId = null)
    {
        return new Organisation
        {
            Id = id,
            Name = name,
            ParentId = parentId
        };
    }

    public void Update(string name)
    {
        Name = name;
    }
}
