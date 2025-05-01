using System.Collections.Generic;

namespace API.Models;

public class ReorderChaptersRequest
{
    public required List<ReorderChapterDto> Chapters { get; set; }
}