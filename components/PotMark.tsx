import type { ComponentProps } from 'react';

type PotMarkProps = ComponentProps<'svg'>;

export function PotMark({ className = '', ...props }: PotMarkProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M33 20.5C33 18.567 34.567 17 36.5 17H83.5C85.433 17 87 18.567 87 20.5C87 26.764 81.925 31.839 75.661 31.839H44.339C38.075 31.839 33 26.764 33 20.5Z"
        fill="currentColor"
      />
      <path
        d="M42.239 33.666H77.761C82.127 33.666 85.884 36.758 86.726 41.042L95.722 86.819C97.415 95.435 90.812 103.5 82.031 103.5H37.969C29.188 103.5 22.585 95.435 24.278 86.819L33.274 41.042C34.116 36.758 37.873 33.666 42.239 33.666Z"
        fill="currentColor"
      />
      <path
        d="M46 46.5C46 44.843 47.343 43.5 49 43.5H71C72.657 43.5 74 44.843 74 46.5C74 48.157 72.657 49.5 71 49.5H49C47.343 49.5 46 48.157 46 46.5Z"
        fill="rgba(247,242,234,0.22)"
      />
    </svg>
  );
}
