import { SetMetadata } from '@nestjs/common';

export const ALLOW_GUEST_KEY = 'allowGuest';
// Marks a JwtAuthGuard-protected route as usable with a guest (support chat)
// token. Without it, guest tokens are rejected.
export const AllowGuest = () => SetMetadata(ALLOW_GUEST_KEY, true);
