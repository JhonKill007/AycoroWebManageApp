import blockedEmailDomainService from "./BlockedEmailDomainService";
import Http from "../Http/HttpClient";

jest.mock("../Http/HttpClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const http = Http as unknown as {
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
};

describe("BlockedEmailDomainService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists domains from ManageApi", async () => {
    http.get.mockResolvedValue({
      data: {
        data: [
          {
            id: "1",
            domain: "example.com",
            isActive: true,
            reason: "abuse",
            includeSubdomains: true,
            createDate: "2026-01-01",
          },
        ],
      },
    });

    const rows = await blockedEmailDomainService.list();
    expect(http.get).toHaveBeenCalledWith("/api/blocked-email-domains", {
      params: { activeOnly: false },
    });
    expect(rows[0].domain).toBe("example.com");
    expect(rows[0].isActive).toBe(true);
  });

  it("creates a domain", async () => {
    http.post.mockResolvedValue({
      data: {
        data: {
          id: "2",
          domain: "example.net",
          isActive: true,
          reason: "seed",
          includeSubdomains: false,
          createDate: "2026-01-02",
        },
      },
    });

    const created = await blockedEmailDomainService.create({
      domain: "example.net",
      reason: "seed",
      includeSubdomains: false,
      isActive: true,
    });

    expect(http.post).toHaveBeenCalledWith("/api/blocked-email-domains", {
      domain: "example.net",
      reason: "seed",
      includeSubdomains: false,
      isActive: true,
    });
    expect(created.id).toBe("2");
  });

  it("activates and deactivates without deleting", async () => {
    http.post.mockResolvedValueOnce({
      data: {
        data: {
          id: "1",
          domain: "example.com",
          isActive: true,
          reason: "abuse",
          includeSubdomains: false,
          createDate: "2026-01-01",
        },
      },
    });
    http.post.mockResolvedValueOnce({
      data: {
        data: {
          id: "1",
          domain: "example.com",
          isActive: false,
          reason: "abuse",
          includeSubdomains: false,
          createDate: "2026-01-01",
        },
      },
    });

    const active = await blockedEmailDomainService.activate("1");
    const inactive = await blockedEmailDomainService.deactivate("1");

    expect(http.post).toHaveBeenNthCalledWith(
      1,
      "/api/blocked-email-domains/1/activate",
    );
    expect(http.post).toHaveBeenNthCalledWith(
      2,
      "/api/blocked-email-domains/1/deactivate",
    );
    expect(active.isActive).toBe(true);
    expect(inactive.isActive).toBe(false);
  });
});
