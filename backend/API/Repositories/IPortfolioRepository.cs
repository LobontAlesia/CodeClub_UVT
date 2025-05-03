using API.Entities;
public interface IPortfolioRepository
{
    Task<List<Portfolio>> GetUserPortfolios(Guid userId);
    Task<List<Portfolio>> GetAllPortfolios();
    Task<Portfolio?> GetPortfolioById(Guid id);
    Task CreatePortfolio(Portfolio portfolio);
    Task UpdatePortfolio(Portfolio portfolio);
    Task DeletePortfolio(Portfolio portfolio);
}
