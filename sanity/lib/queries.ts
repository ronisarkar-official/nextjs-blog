// sanity/lib/queries.ts
import { defineQuery } from 'next-sanity';

export const STARTUPS_QUERY =
	defineQuery(`*[_type == "startup" && defined(slug.current) && !defined($search) || title match $search || category match $search || author->name match $search] | order(_createdAt desc) {
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

export const STARTUP_ID_BY_SLUG = defineQuery(
	`*[_type == "startup" && slug.current == $slug][0]._id`,
);


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
