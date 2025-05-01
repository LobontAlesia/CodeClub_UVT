namespace API.Models;

public class ChapterElementChunkModel : ChapterElementModel
{
    public bool IsChunk { get; set; }
    public int ChunkIndex { get; set; }
    public int TotalChunks { get; set; }
}