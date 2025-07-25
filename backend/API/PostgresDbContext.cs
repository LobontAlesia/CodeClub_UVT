﻿using Microsoft.EntityFrameworkCore;
using API.Entities;

namespace API;

public class PostgresDbContext(DbContextOptions<PostgresDbContext> options) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Primary Keys
        modelBuilder.Entity<User>()
            .HasKey(u => u.Id);

        // UserChapter configuration
        modelBuilder.Entity<UserChapter>(entity =>
        {
            entity.ToTable("UserChapters");

            entity.HasKey(uc => uc.Id);
            entity.Property(uc => uc.UserId).IsRequired();
            entity.Property(uc => uc.ChapterId).IsRequired();
            entity.Property(uc => uc.Completed).IsRequired();
            entity.Property(uc => uc.CreatedAt).IsRequired();
            entity.Property(uc => uc.CompletedAt).IsRequired(false);

            entity.HasOne(uc => uc.User)
                .WithMany()
                .HasForeignKey(uc => uc.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(uc => uc.Chapter)
                .WithMany(c => c.UserChapters)
                .HasForeignKey(uc => uc.ChapterId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserLesson>()
            .HasKey(ul => new { ul.UserId, ul.LessonId });

        modelBuilder.Entity<UserLearningCourse>()
            .HasKey(uc => new { uc.UserId, uc.CourseId });

        // Foreign Keys
        modelBuilder.Entity<User>()
            .HasMany<Role>(u => u.Roles)
            .WithMany(r => r.Users)
            .UsingEntity(j => j.ToTable("RoleUser"));

        modelBuilder.Entity<User>()
            .HasMany(u => u.Badges)
            .WithMany(b => b.Users)
            .UsingEntity(j => j.ToTable("BadgeUser"));

        modelBuilder.Entity<LearningCourse>()
            .HasMany<Tag>(l => l.Tags)
            .WithMany(t => t.LearningCourses);

        modelBuilder.Entity<LearningCourse>()
            .HasMany<Lesson>(l => l.Lessons)
            .WithOne(l => l.LearningCourse);

        modelBuilder.Entity<LearningCourse>()
            .HasOne<Badge>(c => c.Badge)
            .WithOne();

        modelBuilder.Entity<Lesson>()
            .HasMany<Chapter>(l => l.Chapters)
            .WithOne(c => c.Lesson);

        modelBuilder.Entity<ChapterElement>()
            .HasOne(e => e.Chapter)
            .WithMany(c => c.Elements)
            .HasForeignKey(e => e.ChapterId);

        modelBuilder.Entity<ChapterElement>()
            .HasOne<QuizForm>(c => c.Form)
            .WithOne();

        modelBuilder.Entity<UserLesson>()
            .HasOne<User>(ul => ul.User)
            .WithMany()
            .HasForeignKey(ul => ul.UserId);

        modelBuilder.Entity<UserLesson>()
            .HasOne<Lesson>(ul => ul.Lesson)
            .WithMany()
            .HasForeignKey(ul => ul.LessonId);

        modelBuilder.Entity<UserLearningCourse>()
            .HasOne<User>(ulc => ulc.User)
            .WithMany()
            .HasForeignKey(ulc => ulc.UserId);

        modelBuilder.Entity<UserLearningCourse>()
            .HasOne<LearningCourse>(ulc => ulc.LearningCourse)
            .WithMany()
            .HasForeignKey(ulc => ulc.CourseId);

        modelBuilder.Entity<QuizForm>()
            .HasMany(q => q.Questions)
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<QuizSubmission>()
            .HasOne(qs => qs.User)
            .WithMany()
            .HasForeignKey(qs => qs.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<QuizSubmission>()
            .HasOne(qs => qs.Quiz)
            .WithMany()
            .HasForeignKey(qs => qs.QuizId)
            .OnDelete(DeleteBehavior.Cascade);

        // 👇👇👇 NOILE RELAȚII pentru Portfolio și External Badges 👇👇👇

        // User -> Portfolios
        modelBuilder.Entity<User>()
            .HasMany(u => u.Portfolios)
            .WithOne(p => p.User)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Portfolio -> ExternalBadge
        modelBuilder.Entity<Portfolio>()
            .HasOne(p => p.ExternalBadge)
            .WithMany()
            .HasForeignKey(p => p.ExternalBadgeId)
            .OnDelete(DeleteBehavior.SetNull);

        // User -> UserExternalBadges (many-to-many cu entitate intermediară)
        modelBuilder.Entity<UserExternalBadge>()
            .HasKey(ueb => ueb.Id);

        modelBuilder.Entity<UserExternalBadge>()
            .HasOne(ueb => ueb.User)
            .WithMany(u => u.ExternalBadges)
            .HasForeignKey(ueb => ueb.UserId);

        modelBuilder.Entity<UserExternalBadge>()
            .HasOne(ueb => ueb.ExternalBadge)
            .WithMany(b => b.Users)
            .HasForeignKey(ueb => ueb.ExternalBadgeId);
    }

    // 👇 DbSet-urile existente

    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Tag> Tags { get; set; }
    public DbSet<Badge> Badges { get; set; }
    public DbSet<ChapterElement> ChapterElements { get; set; }
    public DbSet<Chapter> Chapters { get; set; }
    public DbSet<Lesson> Lessons { get; set; }
    public DbSet<LearningCourse> LearningCourses { get; set; }
    public DbSet<UserChapter> UserChapters { get; set; }
    public DbSet<UserLesson> UserLessons { get; set; }
    public DbSet<UserLearningCourse> UserLearningCourses { get; set; }
    public DbSet<QuizForm> QuizForms { get; set; }
    public DbSet<QuizQuestion> QuizQuestions { get; set; }
    public DbSet<QuizSubmission> QuizSubmissions { get; set; } = null!;

    // 👇 NOILE DbSet-uri

    public DbSet<Portfolio> Portfolios { get; set; } = null!;
    public DbSet<ExternalBadge> ExternalBadges { get; set; } = null!;
    public DbSet<UserExternalBadge> UserExternalBadges { get; set; } = null!;
}
