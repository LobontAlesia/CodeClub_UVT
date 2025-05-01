using API.Entities;
using API.Models;

namespace API.Mappers;

public static class LessonMapper
{
    public static LessonModel MapLessonEntityToLessonModel(Lesson lesson) =>
        new LessonModel
        {
            Id = lesson.Id,
            Index = lesson.Index,
            Title = lesson.Title,
            Duration = lesson.Duration ?? 0,
            ChapterTitles = lesson.Chapters.OrderBy(c => c.Index).Select(c => c.Title).ToList()
        };
}