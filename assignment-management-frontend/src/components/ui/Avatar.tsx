//  src/components/ui/Avatar.tsx
import { clsx } from 'clsx';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Avatar({ firstName, lastName, src, size = 'md' }: AvatarProps) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-xl' };
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`;

  if (src) {
    return <img src={src} alt={initials} className={clsx('rounded-full object-cover', sizes[size])} />;
  }

  return (
    <div className={clsx('rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium', sizes[size])}>
      {initials || '?'}
    </div>
  );
}