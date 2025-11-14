import * as React from 'react';
import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface CategoryProps {
	value?: string;
	onValueChange?: (value: string) => void;
	disabled?: boolean;
	id?: string;
}

const STARTUP_CATEGORIES = [
	{ value: 'technology', label: 'Technology' },
	{ value: 'fintech', label: 'Fintech' },
	{ value: 'healthcare', label: 'Healthcare' },
	{ value: 'education', label: 'Education' },
	{ value: 'ecommerce', label: 'E-commerce' },
	{ value: 'saas', label: 'SaaS' },
	{ value: 'ai-ml', label: 'AI/ML' },
	{ value: 'blockchain', label: 'Blockchain' },
	{ value: 'gaming', label: 'Gaming' },
	{ value: 'social', label: 'Social' },
	{ value: 'productivity', label: 'Productivity' },
	{ value: 'sustainability', label: 'Sustainability' },
	{ value: 'transportation', label: 'Transportation' },
	{ value: 'real-estate', label: 'Real Estate' },
	{ value: 'food-beverage', label: 'Food & Beverage' },
	{ value: 'fashion', label: 'Fashion' },
	{ value: 'media', label: 'Media' },
	{ value: 'news', label: 'News' },
	{ value: 'security', label: 'Security' },
	{ value: 'other', label: 'Other' },
];

export function Category({ value, onValueChange, disabled, id }: CategoryProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [isOpen, setIsOpen] = useState(false);

	// Filter categories based on search term
	const filteredCategories = useMemo(() => {
		if (!searchTerm.trim()) return STARTUP_CATEGORIES;

		return STARTUP_CATEGORIES.filter(
			(category) =>
				category.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
				category.value.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [searchTerm]);

	// Get the selected category label
	const selectedCategory = STARTUP_CATEGORIES.find(
		(cat) => cat.value === value,
	);

	const handleValueChange = (newValue: string) => {
		onValueChange?.(newValue);
		setIsOpen(false);
		setSearchTerm(''); // Clear search when selection is made
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const clearSearch = () => {
		setSearchTerm('');
	};

	return (
		<Select
			value={value}
			onValueChange={handleValueChange}
			disabled={disabled}
			open={isOpen}
			onOpenChange={setIsOpen}>
			<SelectTrigger id={id} className="w-full">
				<SelectValue placeholder="Select a category">
					{selectedCategory ? selectedCategory.label : 'Select a category'}
				</SelectValue>
			</SelectTrigger>
			<SelectContent className="max-h-[300px]">
				<SelectGroup>
					<SelectLabel className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
						Startup Categories
					</SelectLabel>

					{/* Search Input */}
					<div className="px-2 py-1.5 border-b border-gray-100 dark:border-gray-700">
						<div className="relative">
							<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Search categories..."
								value={searchTerm}
								onChange={handleSearchChange}
								className="pl-8 pr-8 h-8 text-sm"
								onClick={(e) => e.stopPropagation()}
							/>
							{searchTerm && (
								<button
									onClick={clearSearch}
									className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
									type="button">
									<X className="h-4 w-4" />
								</button>
							)}
						</div>
					</div>

					{/* Categories List with Scroll */}
					<div className="max-h-[200px] overflow-y-auto">
						{filteredCategories.length > 0 ?
							filteredCategories.map((category) => (
								<SelectItem
									key={category.value}
									value={category.value}
									className="px-2 py-1.5">
									{category.label}
								</SelectItem>
							))
						:	<div className="px-2 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
								No categories found
							</div>
						}
					</div>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
