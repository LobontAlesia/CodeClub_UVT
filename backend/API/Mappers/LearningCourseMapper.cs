using API.Entities;
using API.Models;

namespace API.Mappers;

public static class LearningCourseMapper
{
    public static LearningCourse MapLearningCourseInputModelToLearningCourse(LearningCourseInputModel model) =>
        new()
        {
            Id = Guid.NewGuid(),
            Title = model.Title,
            Description = model.Description,
            BaseName = model.BaseName,
            Level = model.Level,
            Duration = model.Duration,
            BadgeId = model.BadgeId,
            IsPublished = false
        };

    public static LearningCourseModel MapLearningCourseEntityToLearningCourseModel(LearningCourse course) =>
        new()
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            Level = course.Level,
            Duration = course.Duration,
            IsPublished = course.IsPublished,
            TagNames = course.Tags?.Select(t => t.Name).ToList() ?? []
        };

    public static LearningCourse MapLearningCoursePatchModelToLearningCourseEntity(LearningCoursePatchModel learningCoursePatchModel) =>
        new LearningCourse
        {
            Id = learningCoursePatchModel.Id,
            Title = learningCoursePatchModel.Title,
            Description = learningCoursePatchModel.Description,
            Duration = learningCoursePatchModel.Duration, 
            Level = learningCoursePatchModel.Level,      
            IsPublished = learningCoursePatchModel.IsPublished
        };

}