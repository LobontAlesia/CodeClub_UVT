namespace API.Models;

public class ReorderLessonsRequest
{
    public required List<ReorderLessonDto> Lessons { get; set; }
}