import React from 'react';
import Form from 'next/form';
import { Search } from 'lucide-react';
import SearchFormReset from '../components/SearchFormReset';

const SearchForm = ({ query }: { query?: string }) => {
	return (
		<div className=" mt-8 flex items-center justify-center px-4">
			<Form
				action="/feed"
				role="search"
				aria-label="Site search"
				className="search-form   w-full max-w-xl">
				<label
					htmlFor="site-search"
					className="sr-only">
					Search site
				</label>

				<div
					className="relative flex items-center w-full bg-white/80 dark:bg-black/40 backdrop-blur-md border border-black/12 
                   shadow-sm dark:shadow-none rounded-full px-3 py-2 transition-shadow duration-200 ">
					{/* Left icon */}
					<div className="flex items-center pointer-events-none pl-1 pr-3">
						<svg
							className="w-5 h-5 text-zinc-500 dark:text-zinc-400"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden>
							<path
								d="M21 21l-4.35-4.35"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<circle
								cx="11"
								cy="11"
								r="6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>

					{/* Input */}
					<input
						id="site-search"
						name="query"
						defaultValue={query}
						type="search"
						placeholder="Search components, articles, people..."
						autoComplete="off"
						className="flex-1 min-w-0 bg-transparent text-sm sm:text-base placeholder:text-zinc-500 dark:placeholder:text-zinc-400
                     text-zinc-900 dark:text-white outline-none px-1 py-2 rounded-full transition-colors duration-150
                     focus:placeholder-transparent"
						aria-label="Search"
					/>
					<div className="flex gap-2">{query && <SearchFormReset />}</div>
				</div>
			</Form>
		</div>
	);
};

export default SearchForm;
