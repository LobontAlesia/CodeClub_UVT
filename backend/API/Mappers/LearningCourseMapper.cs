using API.Entities;
using API.Models;

namespace API.Mappers;

public static class LearningCourseMapper
{
    public static LearningCourse MapLearningCourseInputModelToLearningCourse(
        LearningCourseInputModel learningCourseInputModel) =>
        new LearningCourse
        {
            Title = learningCourseInputModel.Title,
            Description = learningCourseInputModel.Description,
            Duration = learningCourseInputModel.Duration,
            BaseName = learningCourseInputModel.BaseName,
            Level = learningCourseInputModel.Level,
            IsPublished = false
        };

    public static LearningCourseModel MapLearningCourseEntityToLearningCourseModel(LearningCourse learningCourse) =>
        new LearningCourseModel
        {
            Id = learningCourse.Id,
            Title = learningCourse.Title,
            Description = learningCourse.Description,
            Duration = learningCourse.Duration,
            Level = learningCourse.Level,
            IsPublished = learningCourse.IsPublished,
            TagNames = learningCourse.Tags.Select(t => t.Name).ToList()
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