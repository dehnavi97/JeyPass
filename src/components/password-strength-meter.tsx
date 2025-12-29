"use client";

import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

type PasswordStrengthMeterProps = {
  password?: string;
};

type Strength = {
  score: number;
  label: string;
  color: string;
};

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { t } = useTranslation();

  const calculateStrength = (pass: string): Strength => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: 'bg-transparent' };

    // Award points for different criteria
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;

    const totalPossibleScore = 6;
    const percentage = (score / totalPossibleScore) * 100;

    if (score <= 2) {
      return { score: percentage, label: t('strength.very_weak'), color: 'bg-red-500' };
    }
    if (score <= 3) {
      return { score: percentage, label: t('strength.weak'), color: 'bg-orange-500' };
    }
    if (score <= 4) {
      return { score: percentage, label: t('strength.medium'), color: 'bg-yellow-500' };
    }
    if (score <= 5) {
      return { score: percentage, label: t('strength.strong'), color: 'bg-green-400' };
    }
    return { score: 100, label: t('strength.very_strong'), color: 'bg-green-600' };
  };

  const strength = useMemo(() => calculateStrength(password || ''), [password, t]);

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Progress value={strength.score} className="h-2" indicatorClassName={cn("transition-all duration-300", strength.color)} />
      <p className="text-sm text-right font-medium transition-colors duration-300" style={{ color: strength.color.replace('bg-', 'text-') }}>
        {t('strength.label')}: {strength.label}
      </p>
    </div>
  );
}

// Add a custom prop to Progress to allow styling the indicator directly
declare module 'react' {
  interface ForwardRefExoticComponent<P> {
    defaultProps?: Partial<P>;
    displayName?: string;
  }
}

const OriginalProgress = Progress;

Progress.defaultProps = {
  ...OriginalProgress.defaultProps,
  indicatorClassName: ''
};

// @ts-ignore
Progress.render = (props: React.ComponentProps<typeof Progress> & { indicatorClassName?: string }) => {
  const { className, value, indicatorClassName, ...rest } = props;
  return (
    <OriginalProgress.Root
      ref={props.ref}
      className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...rest}
    >
      <OriginalProgress.Indicator
        className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </OriginalProgress.Root>
  );
};
