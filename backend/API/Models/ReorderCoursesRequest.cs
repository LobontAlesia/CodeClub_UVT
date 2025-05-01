namespace API.Models;

public class ReorderCoursesRequest
{
    public required List<ReorderCourseDto> Courses { get; set; }
}

public class ReorderCourseDto
{
    public required string Id { get; set; }
    public required int Index { get; set; }
}