'use client';

import React from 'react';
import Form from 'next/form';
import { Search } from 'lucide-react';
import SearchFormReset from '../components/SearchFormReset';

const SearchForm = ({ query }: { query?: string }) => {
	return (
		<div className="mt-8 flex items-center justify-center px-4">
			<Form
				action="/feed"
				role="search"
				aria-label="Site search"
				className="search-form w-full max-w-xl">
				<label
					htmlFor="site-search"
					className="sr-only">
					Search site
				</label>

				<div className="relative flex items-center w-full bg-white/80 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-full px-3 py-2 shadow-sm dark:shadow-none transition-colors duration-150 ">
					{/* Left icon */}
					<div className="flex items-center pointer-events-none pl-1 pr-3">
						<Search
							className="w-5 h-5 text-zinc-500 dark:text-zinc-400"
							aria-hidden="true"
						/>
					</div>

					{/* Input */}
					<input
						id="site-search"
						name="query"
						defaultValue={query}
						type="search"
						placeholder="Search categories, articles, people..."
						autoComplete="off"
						aria-label="Search"
						className="flex-1 min-w-0 bg-transparent text-sm sm:text-base placeholder:text-zinc-500 dark:placeholder:text-zinc-400 text-zinc-900 dark:text-gray-100 outline-none px-1 py-2 rounded-full transition-colors duration-150 focus:placeholder-transparent"
					/>

					{/* Actions (reset/submit) */}
					<div className="flex items-center gap-2">
						{query && <SearchFormReset />}
						{/* Optional submit button (hidden, accessible) */}
						<button
							type="submit"
							className="sr-only"
							aria-hidden>
							Search
						</button>
					</div>
				</div>
			</Form>
		</div>
	);
};

export default SearchForm;
