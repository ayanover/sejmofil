// API functions for e-partycypacja
import { Initiative } from '@/lib/types/initiatives';

const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // Try to get token from localStorage (Supabase format)
    const token0 = localStorage.getItem('sb-db-auth-token.0');
    const token1 = localStorage.getItem('sb-db-auth-token.1');

    if (token0) {
      // Parse the token to extract the actual access_token
      try {
        const tokenData = JSON.parse(atob(token0.split('base64-')[1]));
        return tokenData.access_token;
      } catch (e) {
        console.error('Error parsing auth token:', e);
      }
    }
  }
  return null;
};

// Add auth headers to requests
const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/vnd.api+json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Fetch all initiatives
export const fetchInitiatives = async (): Promise<Initiative[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/initiatives/`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Convert JSON:API format to our Initiative format
    const initiatives = data.data.map(item => {
      // Find tags for this initiative
      const tagRelationships = item.relationships?.tags?.data || [];
      const tags = tagRelationships.map(tagRel => {
        const tagData = data.included?.find(
          included => included.type === 'Tag' && included.id === tagRel.id
        );
        return {
          id: tagRel.id,
          name: tagData?.attributes?.name || 'Unknown'
        };
      });

      return {
        id: item.id,
        title: item.attributes.title,
        summary: item.attributes.description.substring(0, 200) + (item.attributes.description.length > 200 ? '...' : ''),
        category: tags[0]?.name.toLowerCase() || 'other',
        tags: tags,
        author: {
          id: 'author-' + item.id, // No actual author ID in the response
          name: item.attributes['author-name'],
          image: '/avatars/default-user.jpg', // Default image since API doesn't provide one
        },
        createdAt: item.attributes['created-at'],
        votes: item.attributes['votes-count'],
        comments: item.attributes['comments-count'],
        views: 0, // Not provided by API
        supporters: item.attributes['votes-count'] > 0 ? item.attributes['votes-count'] : 0,
      };
    });

    return initiatives;
  } catch (error) {
    console.error('Error fetching initiatives:', error);
    throw error;
  }
};

// Fetch a single initiative by ID
export const fetchInitiativeById = async (id: string): Promise<Initiative | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/initiatives/${id}/`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Find tags for this initiative
    const tagRelationships = data.data.relationships?.tags?.data || [];
    const tags = tagRelationships.map(tagRel => {
      const tagData = data.included?.find(
        included => included.type === 'Tag' && included.id === tagRel.id
      );
      return {
        id: tagRel.id,
        name: tagData?.attributes?.name || 'Unknown'
      };
    });

    // Convert JSON:API format to our Initiative format
    const initiative: Initiative = {
      id: data.data.id,
      title: data.data.attributes.title,
      summary: data.data.attributes.description,
      category: tags[0]?.name.toLowerCase() || 'other',
      tags: tags,
      author: {
        id: 'author-' + data.data.id,
        name: data.data.attributes['author-name'],
        image: '/avatars/default-user.jpg',
      },
      createdAt: data.data.attributes['created-at'],
      votes: data.data.attributes['votes-count'],
      comments: data.data.attributes['comments-count'],
      views: 0,
      supporters: data.data.attributes['votes-count'] > 0 ? data.data.attributes['votes-count'] : 0,
      // Extract and include template sections if needed
      templateSections: [
        {
          id: 'section-1',
          type: 'text',
          title: 'Treść inicjatywy',
          content: data.data.attributes.description,
          order: 0
        }
      ]
    };

    return initiative;
  } catch (error) {
    console.error('Error fetching initiative:', error);
    return null;
  }
};

// Vote on an initiative
export const voteOnInitiative = async (initiativeId: string, value: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/votes/initiative/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        data: {
          type: "vote-view-sets",
          attributes: {
            initiative_id: parseInt(initiativeId),
            value: value
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error voting on initiative:', error);
    return false;
  }
};

// Vote on a comment
export const voteOnComment = async (commentId: string, value: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/votes/comment/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        data: {
          type: "vote-view-sets",
          attributes: {
            comment_id: parseInt(commentId),
            value: value
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error voting on comment:', error);
    return false;
  }
};

// Add a comment to an initiative
export const addComment = async (initiativeId: string, content: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        data: {
          type: "Comment",
          attributes: {
            content: content,
            initiative_id: parseInt(initiativeId)
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Add a reply to a comment
export const addReply = async (commentId: string, content: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        data: {
          type: "Comment",
          attributes: {
            content: content,
            parent_id: parseInt(commentId)
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding reply:', error);
    throw error;
  }
};