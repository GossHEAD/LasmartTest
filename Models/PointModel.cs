using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PointService.Models;

public class PointModel
{
    public int Id { get; set; } 
    public double X { get; set; }
    public double Y { get; set; }
    public double Radius { get; set; }
    [Required] 
    public string Color { get; set; } = "#000000"; 
    
    public virtual ICollection<CommentModel> Comments { get; set; } = new List<CommentModel>();
}