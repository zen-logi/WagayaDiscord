using System.ComponentModel.DataAnnotations;

namespace WagayaDiscord.Server.Entities;

public enum ChannelType
{
    Text = 0,
    Voice = 1
}

public class Channel
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public ChannelType Type { get; set; } = ChannelType.Text;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
