// Initiative-related type definitions

// Author information
export interface InitiativeAuthor {
  id: string;
  name: string;
  image: string;
  title?: string;
  organization?: string;
}

// Tag information
export interface InitiativeTag {
  id: string;
  name: string;
}

// For bullet list sections
export interface BulletPoint {
  id: string;
  text: string;
}

// For attachment sections
export interface Attachment {
  id: string;
  name: string;
  url?: string;
  description: string;
}

// For transcript sections
export interface Transcript {
  id: string;
  title: string;
  content: string;
  source: string;
}

// Template section types
export interface TemplateSection {
  id: string;
  type: 'bullet-list' | 'attachment' | 'transcript' | 'text';
  title: string;
  content: BulletPoint[] | Attachment[] | Transcript | string;
  order: number;
}

// Main initiative interface
export interface Initiative {
  id: string;
  title: string;
  summary: string;
  category: string;
  tags: InitiativeTag[];
  author: InitiativeAuthor;
  createdAt: string;
  votes: number;
  comments: number;
  views: number;
  supporters: number;
  templateSections?: TemplateSection[];
}

// Comment interfaces
export interface CommentAuthor {
  id: string;
  name: string;
  image?: string;
}

export interface CommentVotes {
  upvotes: number;
  downvotes: number;
}

export interface Comment {
  id: string;
  author: CommentAuthor;
  content: string;
  createdAt: string;
  votes: CommentVotes;
  parentId: string | null;
}

// Sort and filter types
export type SortOption = 'newest' | 'oldest' | 'popular' | 'mostCommented' | 'mostSupported';
export type FilterCategory = 'all' | 'economic' | 'monetary' | 'environmental' | 'social' | 'foreign' | 'healthcare' | 'education' | 'other';

// JSON:API interfaces
export interface JsonApiRelationship {
  data: { type: string; id: string }[];
  meta?: { count: number };
}

export interface JsonApiAttributes {
  title: string;
  description: string;
  status: string;
  'created-at': string;
  'updated-at': string;
  'author-name': string;
  'comments-count': number;
  'votes-count': number;
  'user-has-voted': boolean;
  'user-vote-value': number;
  [key: string]: any;
}

export interface JsonApiResource {
  type: string;
  id: string;
  attributes: JsonApiAttributes;
  relationships?: {
    [key: string]: JsonApiRelationship;
  };
}

export interface JsonApiResponse {
  data: JsonApiResource | JsonApiResource[];
  included?: JsonApiResource[];
  meta?: {
    'page-count': number;
    'total-count': number;
    [key: string]: any;
  };
  links?: {
    self: string;
    first?: string;
    last?: string;
    next?: string;
    prev?: string;
  };
}