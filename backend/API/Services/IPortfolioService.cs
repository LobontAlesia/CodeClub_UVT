using API.Models;

public interface IPortfolioService
{
    Task<List<PortfolioModel>> GetUserPortfolios(Guid userId);
    Task<List<PortfolioModel>> GetAllPortfolios();
    Task CreatePortfolio(Guid userId, PortfolioInputModel model);
    Task UpdatePortfolioStatus(Guid portfolioId, string status, string feedback, Guid? externalBadgeId);
    Task<PortfolioModel?> GetPortfolioById(Guid id);
    Task UpdatePortfolio(Guid portfolioId, PortfolioInputModel model);
    Task DeletePortfolio(Guid portfolioId);
}
