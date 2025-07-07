import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../constant/public-access-key';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
