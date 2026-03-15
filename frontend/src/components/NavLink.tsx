'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface NavLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
    exact?: boolean;
    activeClassName?: string;
    pendingClassName?: string; // Standardized for spec but unused in Next.js basic routing
}

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
    ({ className, activeClassName, href, exact = false, ...props }, ref) => {
        const pathname = usePathname();
        const hrefString = href.toString();

        // Determine active state
        const isActive = exact
            ? pathname === hrefString
            : pathname.startsWith(hrefString);

        return (
            <Link
                ref={ref}
                href={href}
                className={cn(className, isActive && activeClassName)}
                {...props}
            />
        );
    }
);
NavLink.displayName = "NavLink";
