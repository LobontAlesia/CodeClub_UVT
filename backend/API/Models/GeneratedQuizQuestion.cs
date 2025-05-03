namespace API.Models;

public class GeneratedQuizQuestion
{
    public string Question { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public int CorrectAnswerIndex { get; set; }
    public string? Explanation { get; set; }
}