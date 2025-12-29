import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-xl text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 uppercase tracking-wider',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20',
				gold: 'gold-gradient text-black hover:opacity-90 shadow-lg shadow-yellow-500/20',
				destructive:
          'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20',
				outline:
          'border border-yellow-500/30 bg-transparent hover:bg-yellow-500/10 text-yellow-500',
				secondary:
          'bg-white/5 text-white hover:bg-white/10 border border-white/10',
				ghost: 'hover:bg-white/5 text-gray-400 hover:text-white',
				link: 'text-yellow-500 underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-11 px-6 py-2.5',
				sm: 'h-9 rounded-lg px-4 text-xs',
				lg: 'h-14 rounded-2xl px-10 text-base',
				icon: 'h-10 w-10 rounded-xl',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'button';
	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			ref={ref}
			{...props}
		/>
	);
});
Button.displayName = 'Button';

export { Button, buttonVariants };
