using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PointService.Models;

public class CommentModel
{
    public int Id { get; set; } 
    [Required]
    public string Text { get; set; } = string.Empty;
    [Required]
    public string BackgroundColor { get; set; } = "#FFFFFF"; 
    public int PointId { get; set; }
    
    [JsonIgnore]
    public virtual PointModel? Point { get; set; }
}