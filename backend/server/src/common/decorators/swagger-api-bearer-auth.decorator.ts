import { SetMetadata } from '@nestjs/common';

export const ApiBearerAuthAll = () => SetMetadata('apiBearerAuth', true);
