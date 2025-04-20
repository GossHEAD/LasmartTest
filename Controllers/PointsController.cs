using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PointService.Data;
using PointService.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PointService.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PointsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PointsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Points - Получить все точки с комментариями
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PointModel>>> GetPoints()
    {
        return await _context.Points
                             .Include(p => p.Comments) // Включаем связанные комментарии
                             .ToListAsync();
    }

    // POST: api/Points - Добавить новую точку
    [HttpPost]
    public async Task<ActionResult<PointModel>> PostPoint(PointModel point)
    {
        if (point == null)
        { 
            return BadRequest("Point data is null.");
        }
        point.Id = 0; point.Comments = new List<CommentModel>();

        _context.Points.Add(point);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetPoint), new { id = point.Id }, point);
    }

    // GET: api/Points/{id} - Получить точку по ID 
    [HttpGet("{id}")]
    public async Task<ActionResult<PointModel>> GetPoint(int id)
    {
        var point = await _context.Points
                                .Include(p => p.Comments)
                                .FirstOrDefaultAsync(p => p.Id == id);

        if (point == null)
        {
            return NotFound();
        }

        return point;
    }


    // DELETE: api/Points/{id} - Удалить точку по ID
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePoint(int id)
    {
        var point = await _context.Points.FindAsync(id);
        if (point == null)
        {
            return NotFound(); 
        }

        _context.Points.Remove(point);
        await _context.SaveChangesAsync();

        return NoContent(); 
    }

    // POST: api/Points/{pointId}/comments - Добавить комментарий к точке
    [HttpPost("{pointId}/comments")]
    public async Task<ActionResult<CommentModel>> PostComment(int pointId, CommentModel comment)
    { 
        if (comment == null) 
            return BadRequest("Comment data is null."); 
         
        var point = await _context.Points.FindAsync(pointId);
        if (point == null)
            return NotFound($"Point with Id {pointId} not found."); 
        
        comment.PointId = pointId;
        comment.Id = 0;
        comment.Point = null; 

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetComment), new { id = comment.Id, pointId = pointId }, comment); // Предполагается наличие GetComment
    }


     // GET: api/Points/{pointId}/comments/{id} - Получить комментарий по ID
    [HttpGet("{pointId}/comments/{id}")]
    public async Task<ActionResult<CommentModel>> GetComment(int pointId, int id)
    {
         var comment = await _context.Comments
                                    .FirstOrDefaultAsync(c => c.Id == id && c.PointId == pointId);

         if (comment == null)
         {
             return NotFound();
         }
         return comment;
    }
    
    // PUT: api/Points/{id} - Обновить точку
    [HttpPut("{id}")]
    public async Task<IActionResult> PutPoint(int id, PointModel pointModel)
    {
        if (id != pointModel.Id)
        {
            return BadRequest("ID в URL не совпадает с ID в теле запроса.");
        }
        
        var existingPoint = await _context.Points.FindAsync(id);
        if (existingPoint == null)
        {
            return NotFound($"Точка с ID {id} не найдена.");
        }
        
        existingPoint.X = pointModel.X; 
        existingPoint.Y = pointModel.Y; 
        existingPoint.Radius = pointModel.Radius;
        existingPoint.Color = pointModel.Color;

        _context.Entry(existingPoint).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!PointExists(id)) 
            {
                return NotFound();
            }
            else
            {
                throw; 
            }
        }

        return NoContent(); 
    }
    
    // PUT: api/Points/{pointId}/comments/{id} - Обновить комментарий
    [HttpPut("{pointId}/comments/{id}")]
    public async Task<IActionResult> PutComment(int pointId, int id, CommentModel commentModel)
    {
        if (id != commentModel.Id)
        {
             return BadRequest("ID комментария в URL не совпадает с ID в теле запроса.");
        }
        if (pointId != commentModel.PointId) 
        {
             return BadRequest("ID точки в URL не совпадает с PointId в теле запроса.");
        }
        
        var existingComment = await _context.Comments
                                      .FirstOrDefaultAsync(c => c.Id == id && c.PointId == pointId);

        if (existingComment == null)
        {
            return NotFound($"Комментарий с ID {id} для точки {pointId} не найден.");
        }
        
        existingComment.Text = commentModel.Text;
        existingComment.BackgroundColor = commentModel.BackgroundColor;

        _context.Entry(existingComment).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CommentExists(id, pointId))
            {
                 return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent(); 
    }
    
    private bool PointExists(int id)
    {
        return _context.Points.Any(e => e.Id == id);
    }

    private bool CommentExists(int id, int pointId)
    {
         return _context.Comments.Any(e => e.Id == id && e.PointId == pointId);
    }
}