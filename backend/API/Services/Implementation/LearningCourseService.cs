using API.Entities;
using API.Mappers;
using API.Models;
using API.Repositories;

namespace API.Services.Implementation;

public class LearningCourseService(
    ITagRepository tagRepository,
    IBadgeRepository badgeRepository,
    ILearningCourseRepository learningCourseRepository
) : ILearningCourseService
{
    public async Task<bool> CreateAsync(LearningCourseInputModel learningCourseInputModel)
    {
        var badge = await badgeRepository.GetByIdAsync(learningCourseInputModel.BadgeId);
        if (badge == null)
        {
            throw new ArgumentException("Badge not found");
        }

        bool isUsedById = await learningCourseRepository.ExistsWithBadgeAsync(badge.Id);
        if (isUsedById)
        {
            throw new InvalidOperationException("Badge is already used by another course");
        }

        List<Tag> tags = [];
        foreach (string tagName in learningCourseInputModel.TagNames)
        {
            Tag? tag = await tagRepository.GetByNameAsync(tagName);
            tags.Add(tag ?? new Tag { Name = tagName });
        }

        LearningCourse learningCourse = LearningCourseMapper.MapLearningCourseInputModelToLearningCourse(learningCourseInputModel);
        learningCourse.Badge = badge;
        learningCourse.BadgeId = badge.Id;
        learningCourse.Tags = tags;

        LearningCourse? createdCourse = await learningCourseRepository.CreateAsync(learningCourse);

        return createdCourse != null;
    }

    public async Task<bool> UpdateAsync(LearningCoursePatchModel learningCoursePatchModel)
    {
        LearningCourse? learningCourse = await learningCourseRepository.GetByIdAsync(learningCoursePatchModel.Id);
        if (learningCourse == null)
        {
            return false;
        }

        List<Tag> tags = [];
        foreach (string tagName in learningCoursePatchModel.TagNames)
        {
            Tag? tag = await tagRepository.GetByNameAsync(tagName);
            tags.Add(tag ?? new Tag { Name = tagName });
        }

        learningCourse.Title = learningCoursePatchModel.Title;
        learningCourse.Description = learningCoursePatchModel.Description;
        learningCourse.IsPublished = learningCoursePatchModel.IsPublished;
        learningCourse.Tags = tags;
        learningCourse.Level = learningCoursePatchModel.Level;
        learningCourse.Duration = learningCoursePatchModel.Duration;
        learningCourse.BaseName = learningCoursePatchModel.BaseName;

        // Update badge if provided
        if (learningCoursePatchModel.BadgeId.HasValue)
        {
            var badge = await badgeRepository.GetByIdAsync(learningCoursePatchModel.BadgeId.Value);
            if (badge != null)
            {
                bool isUsedById = await learningCourseRepository.ExistsWithBadgeAsync(badge.Id, learningCourse.Id);
                if (isUsedById)
                {
                    throw new InvalidOperationException("Badge is already used by another course");
                }

                learningCourse.Badge = badge;
                learningCourse.BadgeId = badge.Id;
            }
        }

        LearningCourse? updatedCourse = await learningCourseRepository.UpdateAsync(learningCourse);

        return updatedCourse != null;
    }
}
