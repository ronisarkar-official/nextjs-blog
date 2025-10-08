// sanity/lib/queries.ts
import { defineQuery } from 'next-sanity';

export const STARTUPS_QUERY =
	defineQuery(`*[_type == "startup" && defined(slug.current) && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(_createdAt desc) {
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  image,
}`);

export const RECENT_STARTUPS_QUERY = defineQuery(`
  *[_type == "startup" && defined(slug.current)] 
  | order(_createdAt desc)[0..3] {
    _id,
    title,
    "slug": slug.current,
    _createdAt,
    author->{ _id, name, image, bio },
    views,
    description,
    category,
    image
  }
`);

// Query to fetch data required for the RSS feed
export const RSS_STARTUPS_QUERY = defineQuery(`
  *[_type == "startup" && defined(slug.current)] | order(_createdAt desc) [0..49] {
    _id,
    title,
    "slug": slug.current,
    "pubDate": _createdAt,
    description, // Assuming this is the summary/excerpt
    // Fetch author name to credit the item, if desired
    author->{ name },
  }
`);

// Returns an array of slug strings: ['hello-world', 'another-post']
export const ALL_STARTUP_SLUG_STRINGS = defineQuery(
	`*[_type == "startup" && defined(slug.current)].slug.current`,
);

export const STARTUP_BY_ID_QUERY = defineQuery(
	`*[_type == "startup" && _id == $id][0]{
    _id,
    title,
    slug,
    _createdAt,
    author -> { _id, name, username, image, bio },
    views,
    description,
    category,
    image,
    pitch,
  }`,
);

export const STARTUP_BY_SLUG_QUERY = defineQuery(
	`*[_type == "startup" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    _createdAt,
    author -> { _id, name, username, image, bio },
    views,
    description,
    category,
    image,
    pitch,
  }`,
);

// Related startups by category, excluding the current slug
export const RELATED_STARTUPS_BY_CATEGORY = defineQuery(`
  *[_type == "startup" && defined(slug.current) && category == $category && slug.current != $slug]
  | order(_createdAt desc)[0..3] {
    _id,
    title,
    "slug": slug.current,
    _createdAt,
    author->{ _id, name, image, bio },
    views,
    description,
    category,
    image
  }
`);

// Previous startup in same category by created date
export const PREV_STARTUP_IN_CATEGORY = defineQuery(`
  *[_type == "startup" && defined(slug.current) && category == $category && _createdAt < $createdAt]
  | order(_createdAt desc)[0]{
    _id,
    title,
    "slug": slug.current,
    _createdAt,
    category
  }
`);

// Next startup in same category by created date
export const NEXT_STARTUP_IN_CATEGORY = defineQuery(`
  *[_type == "startup" && defined(slug.current) && category == $category && _createdAt > $createdAt]
  | order(_createdAt asc)[0]{
    _id,
    title,
    "slug": slug.current,
    _createdAt,
    category
  }
`);

// Global previous (any category) by created date
export const PREV_STARTUP_GLOBAL = defineQuery(`
  *[_type == "startup" && defined(slug.current) && _createdAt < $createdAt]
  | order(_createdAt desc)[0]{
    _id,
    title,
    "slug": slug.current,
    _createdAt,
    category
  }
`);

// Global next (any category) by created date
export const NEXT_STARTUP_GLOBAL = defineQuery(`
  *[_type == "startup" && defined(slug.current) && _createdAt > $createdAt]
  | order(_createdAt asc)[0]{
    _id,
    title,
    "slug": slug.current,
    _createdAt,
    category
  }
`);

export const ALL_STARTUP_SLUGS = defineQuery(
	`*[_type == "startup" && defined(slug.current)]{ "slug": slug.current, _id }`,
);

export const STARTUP_VIEWS_QUERY = defineQuery(
	`*[_type == "startup" && _id == $id][0]{ _id, views }`,
);

export const AUTHOR_BY_GITHUB_ID_QUERY = defineQuery(
	`*[_type == "author" && id == $id][0]{ _id, id, name, username, email, image, bio }`,
);

export const AUTHOR_BY_ID_QUERY = defineQuery(
	`*[_type == "author" && _id == $id][0]{ _id, id, name, username, email, image, bio }`,
);

export const AUTHOR_BY_EMAIL_QUERY = defineQuery(
	`*[_type == "author" && email == $email][0]{ _id, id, name, username, email, image, bio }`,
);

export const STARTUP_ID_BY_SLUG = defineQuery(
	`*[_type == "startup" && slug.current == $slug][0]._id`,
);

export const ALL_STARTUP_ROUTES_QUERY =
	defineQuery(`*[_type == "startup" && defined(slug.current)] {
    "slug": slug.current,
    "lastModified": _updatedAt
  }`);

export const STARTUPS_BY_AUTHOR_QUERY = defineQuery(
	`*[_type == "startup" && author._ref == $id] | order(_createdAt desc) {
    _id,
    title,
    slug,
    _createdAt,
    author -> { _id, name, image, bio },
    views,
    description,
    category,
    image,
  }`,
);

export const PLAYLIST_BY_SLUG_QUERY = defineQuery(
	`*[_type == "playlist" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    select[]->{
      _id,
      _createdAt,
      title,
      slug,
      author->{
        _id,
        name,
        slug,
        image,
        bio
      },
      views,
      description,
      category,
      image,
      pitch
    }
  }`,
);

// Comment queries
export const COMMENTS_BY_STARTUP_QUERY = defineQuery(
	`*[_type == "comment" && startup._ref == $startupId && isApproved == true && !defined(parentComment)] {
    _id,
    content,
    createdAt,
	   guestName,
	   user->{ _id, name, image },
    "replies": *[_type == "comment" && parentComment._ref == ^._id && isApproved == true] {
      _id,
      content,
      createdAt,
	     guestName,
	     user->{ _id, name, image }
    }
  } | order(createdAt asc)`,
);

export const COMMENT_COUNT_BY_STARTUP_QUERY = defineQuery(
	`count(*[_type == "comment" && startup._ref == $startupId && isApproved == true])`,
);

// Notifications removed
