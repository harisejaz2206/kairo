import { SetMetadata } from '@nestjs/common';

/**
 * Marks a route as publicly accessible.
 * Guards should check IS_PUBLIC_KEY and skip auth when true.
 *
 * Usage: @Public() on a controller method or class.
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
