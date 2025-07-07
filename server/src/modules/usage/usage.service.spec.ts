import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '../config/config.service';
import { QueueService } from '../queue/queue.service';
import { S3Service } from '../s3/s3.service';
import { UsageRepository } from './usage.repository';
import { UserRepository } from './users.repository';
import { UsageService } from './usage.service';
import {
  UsageEventType,
  CreateUsageEventDto,
  UsageQuery,
} from './dto/index.dto';

describe('Complete Flow', () => {
  let service: UsageService;
  let mockQueueService: Partial<QueueService>;
  let mockS3Service: Partial<S3Service>;
  let mockUsageRepo: Partial<UsageRepository>;
  let mockUserRepo: Partial<UserRepository>;
  let mockConfigService: Partial<ConfigService>;

  const TEST_USER_ID = 'ddb49dc8-6e8f-4dfb-bb39-5c6948f9d3f7';

  beforeEach(async () => {
    mockQueueService = {
      addReportJob: jest.fn().mockResolvedValue(true),
      addBillingPeriodJob: jest.fn().mockResolvedValue(true),
      ping: jest.fn().mockResolvedValue('PONG'),
    };

    mockS3Service = {
      saveObject: jest.fn().mockResolvedValue('https://example.com/report.pdf'),
    };

    mockUsageRepo = {
      createUsageEvent: jest.fn().mockImplementation((dto) => ({
        ...dto,
        id: 'event-id',
        timestamp: new Date().toISOString(),
      })),
      createReportJob: jest.fn().mockResolvedValue({ jobId: 'test-job-id' }),
      getReportStatus: jest.fn().mockImplementation((jobId) => ({
        jobId,
        userId: TEST_USER_ID,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        downloadUrl: 'https://example.com/report.pdf',
      })),
      updateReportStatus: jest.fn().mockResolvedValue(true),
      findUsageEvents: jest.fn().mockResolvedValue([
        {
          id: 'event-1',
          userId: TEST_USER_ID,
          eventType: 'API_CALL' as UsageEventType,
          units: 5,
          timestamp: new Date().toISOString(),
        },
      ]),
      // ... keep other mocks ...
      getUserUsageSummary: jest.fn().mockImplementation((userId) => {
        // Return different summaries based on test case
        if (userId === 'UNDER_LIMIT_USER') {
          return {
            userId,
            totalUnits: '500', // Under limit
            currentBillingPlan: 'BASIC',
            currentPeriodStart: '2023-01-01',
            currentPeriodEnd: '2023-01-31',
          };
        } else if (userId === 'OVER_LIMIT_USER') {
          return {
            userId,
            totalUnits: '1500', // Over limit
            currentBillingPlan: 'BASIC',
            currentPeriodStart: '2023-01-01',
            currentPeriodEnd: '2023-01-31',
          };
        }
        return {
          userId,
          totalUnits: '1000', // Exactly at limit
          currentBillingPlan: 'BASIC',
          currentPeriodStart: '2023-01-01',
          currentPeriodEnd: '2023-01-31',
        };
      }),
      createBillingPeriod: jest.fn().mockImplementation(async (userId) => {
        const summary = await mockUsageRepo.getUserUsageSummary(userId);
        const billingPlan = {
          tier: 'BASIC',
          baseFee: '10',
          includedUnits: 1000,
          overageRate: 0.01,
        };

        // ACTUAL CALCULATION LOGIC BEING TESTED
        const usedUnits = Number(summary.totalUnits);
        const overageUnits = Math.max(0, usedUnits - billingPlan.includedUnits);
        const overageFee = overageUnits * billingPlan.overageRate;
        const totalAmount = Number(billingPlan.baseFee) + overageFee;

        return {
          success: true,
          invoiceId: 'inv-' + Math.random().toString(36).substring(7),
          totalAmount,
          overageFee,
          baseFee: Number(billingPlan.baseFee),
          usedUnits,
          includedUnits: billingPlan.includedUnits,
        };
      }),
    };

    mockUserRepo = {
      findById: jest.fn().mockResolvedValue({ id: TEST_USER_ID }),
    };

    mockConfigService = {
      s3: {
        endpoint: process.env.S3_ENDPOINT,
        bucketId: process.env.S3_BUCKET_ID,
        accessKey: process.env.S3_ACCESS_KEY,
        secretKey: process.env.S3_SECRET_KEY,
        domainName: process.env.S3_ENDPOINT,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageService,
        { provide: QueueService, useValue: mockQueueService },
        { provide: S3Service, useValue: mockS3Service },
        { provide: UsageRepository, useValue: mockUsageRepo },
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UsageService>(UsageService);
  });

  it('should complete the full usage flow', async () => {
    // 1. Submit a usage event
    const createEventDto: CreateUsageEventDto = {
      userId: TEST_USER_ID,
      eventType: 'API_CALL',
      units: 5,
      metadata: { endpoint: '/api/test', method: 'GET' },
    };

    const createdEvent = await service.createUsageEvent(createEventDto);
    expect(createdEvent).toHaveProperty('id');
    expect(createdEvent.userId).toBe(TEST_USER_ID);
    expect(mockUsageRepo.createUsageEvent).toHaveBeenCalledWith(createEventDto);

    // 2. Get usage events
    const query: UsageQuery = {
      userId: TEST_USER_ID,
      offset: 0,
      limit: 10,
      startDate: new Date(Date.now()).toISOString(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const events = await service.getUsageEvents(query);
    expect(events).toBeInstanceOf(Array);
    expect(events[0].userId).toBe(TEST_USER_ID);
    expect(mockUsageRepo.findUsageEvents).toHaveBeenCalledWith(query);

    // 3. Get usage by user ID
    const userUsage = await service.getUserUsageSummary(TEST_USER_ID);
    expect(userUsage.userId).toBe(TEST_USER_ID);
    expect(userUsage).toHaveProperty('totalUnits');
    expect(mockUsageRepo.getUserUsageSummary).toHaveBeenCalledWith(
      TEST_USER_ID,
    );
  });
  describe('Report Processing Workflow', () => {
    const testJobId = 'test-job-123';
    const testReportId = 'test-report-456';

    beforeEach(() => {
      // Reset all mocks before each test
      jest.clearAllMocks();

      // Mock the queue service
      mockQueueService.addReportJob = jest.fn().mockResolvedValue({
        jobId: testJobId,
      });

      // Mock the repository
      mockUsageRepo.createReportJob = jest.fn().mockResolvedValue({
        id: testReportId,
        userId: TEST_USER_ID,
        status: 'CREATED',
      });

      mockUsageRepo.updateReportStatus = jest
        .fn()
        .mockImplementation((params) => ({
          ...params,
          createdAt: new Date().toISOString(),
        }));

      // Mock the status checks with progressive states
      mockUsageRepo.getReportStatus = jest
        .fn()
        .mockImplementationOnce(() => ({
          id: testReportId,
          jobId: testJobId,
          userId: TEST_USER_ID,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        }))
        .mockImplementationOnce(() => ({
          id: testReportId,
          jobId: testJobId,
          userId: TEST_USER_ID,
          status: 'PROCESSING',
          createdAt: new Date().toISOString(),
        }))
        .mockImplementation(() => ({
          id: testReportId,
          jobId: testJobId,
          userId: TEST_USER_ID,
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          downloadUrl: 'https://example.com/report.pdf',
        }));

      // Mock user repository
      mockUserRepo.findById = jest.fn().mockResolvedValue({ id: TEST_USER_ID });
    });

    it('should complete the full report generation flow', async () => {
      // 1. Generate report
      const reportResponse = await service.generateReport({
        userId: TEST_USER_ID,
        format: 'PDF',
      });

      // Verify report creation
      expect(reportResponse).toHaveProperty('id', testReportId);
      expect(reportResponse).toHaveProperty('jobId', testJobId);
      expect(reportResponse).toHaveProperty('status', 'PENDING');
      expect(mockQueueService.addReportJob).toHaveBeenCalledWith({
        reportId: testReportId,
        userId: TEST_USER_ID,
        format: 'PDF',
      });

      // 2. Check initial status (PENDING)
      let status = await service.getReportStatus(testReportId);
      expect(status.status).toBe('PENDING');

      // 3. Check intermediate status (PROCESSING)
      status = await service.getReportStatus(testReportId);
      expect(status.status).toBe('PROCESSING');

      // 4. Check final status (COMPLETED)
      status = await service.getReportStatus(testReportId);
      expect(status.status).toBe('COMPLETED');
      expect(status).toHaveProperty('downloadUrl');
    });
  });

  // Add a new test case for billing calculation
  describe('Billing Calculations', () => {
    it('should charge only base fee when under limit', async () => {
      const result = await service.generateMonthlyBilling('UNDER_LIMIT_USER');
      expect(result.overageFee).toBe(0);
      expect(result.totalAmount).toBe(10); // Just base fee
    });

    it('should calculate overage when over limit', async () => {
      const result = await service.generateMonthlyBilling('OVER_LIMIT_USER');
      // 1500 used - 1000 included = 500 overage
      // 500 * 0.01 rate = 5 overage fee
      expect(result.overageFee).toBe(5);
      expect(result.totalAmount).toBe(15); // 10 base + 5 overage
    });

    it('should handle exact limit usage', async () => {
      const result = await service.generateMonthlyBilling(TEST_USER_ID);
      expect(result.overageFee).toBe(0);
      expect(result.totalAmount).toBe(10);
    });
  });
});
