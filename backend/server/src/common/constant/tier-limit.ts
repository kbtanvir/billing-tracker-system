import { UserTier } from '../enum/user-tiers';

export interface TierLimits {
  maxBucketSize: number;
  maxFileSize: number;
  customDomainLimit: number;
  freeWebsiteCount: number;
}

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  [UserTier.FREE]: {
    maxBucketSize: 200 * 1024 * 1024, // 200 MB
    maxFileSize: 4 * 1024 * 1024, // 4 MB per file
    customDomainLimit: 1,
    freeWebsiteCount: 5,
  },
  [UserTier.STARTER]: {
    maxBucketSize: 500 * 1024 * 1024, // 500 MB
    maxFileSize: 4 * 1024 * 1024, // 4 MB per file
    customDomainLimit: 10,
    freeWebsiteCount: 20,
  },
  [UserTier.MEDIUM]: {
    maxBucketSize: 5 * 1024 * 1024 * 1024, // 5 GB
    maxFileSize: 4 * 1024 * 1024, // 4 MB per file
    customDomainLimit: 20,
    freeWebsiteCount: 100,
  },
  [UserTier.LARGE]: {
    maxBucketSize: 10 * 1024 * 1024 * 1024, // 10 GB
    maxFileSize: 4 * 1024 * 1024, // 4 MB per file
    customDomainLimit: 50,
    freeWebsiteCount: 100,
  },
};
