'use client'
import React, { useState } from 'react';
import {
  ArrowRight,
  PlusCircle,
  Trash2,
  FileText,
  Paperclip,
  Edit,
  ListPlus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BulletPoint {
  id: string;
  text: string;
}

interface Attachment {
  id: string;
  name: string;
  url?: string;
  file?: File;
  description: string;
}

interface Transcript {
  id: string;
  title: string;
  content: string;
  source: string;
}

interface TemplateSection {
  id: string;
  type: 'bullet-list' | 'attachment' | 'transcript' | 'text';
  title: string;
  content: BulletPoint[] | Attachment[] | Transcript | string;
  order: number;
}

interface InitiativeFormData {
  title: string;
  summary: string;
  category: string;
  tags: string[];
  author: string;
  templateSections: TemplateSection[];
}

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

const SejmofilInitiativeForm: React.FC = () => {
  const router = useRouter();
  const [tagInput, setTagInput] = useState<string>('');
  const [formData, setFormData] = useState<InitiativeFormData>({
    title: '',
    summary: '',
    category: '',
    tags: [],
    author: '',
    templateSections: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleAddTemplateSection = (type: TemplateSection['type']) => {
    const newId = `section-${Date.now()}`;
    const newSection: TemplateSection = {
      id: newId,
      type,
      title: `Nowa sekcja ${type === 'bullet-list' ? 'listy' : type === 'attachment' ? 'załączników' : type === 'transcript' ? 'transkryptu' : 'tekstu'}`,
      order: formData.templateSections.length,
      content: type === 'bullet-list'
        ? [] as BulletPoint[]
        : type === 'attachment'
          ? [] as Attachment[]
          : type === 'transcript'
            ? {
                id: `transcript-${Date.now()}`,
                title: '',
                content: '',
                source: ''
              } as Transcript
            : '' as string,
    };

    setFormData((prev) => ({
      ...prev,
      templateSections: [...prev.templateSections, newSection],
    }));
  };

  // Remove a template section
  const handleRemoveTemplateSection = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      templateSections: prev.templateSections.filter((section) => section.id !== id),
    }));
  };

  // Update a template section's title
  const handleUpdateSectionTitle = (id: string, title: string) => {
    setFormData((prev) => ({
      ...prev,
      templateSections: prev.templateSections.map((section) =>
        section.id === id ? { ...section, title } : section
      ),
    }));
  };

  // Handle bullet list items
  const handleAddBulletPoint = (sectionId: string) => {
    setFormData((prev) => {
      const updatedSections = prev.templateSections.map((section) => {
        if (section.id === sectionId && section.type === 'bullet-list') {
          return {
            ...section,
            content: [
              ...(section.content as BulletPoint[]),
              { id: `bullet-${Date.now()}`, text: '' },
            ],
          };
        }
        return section;
      });
      return { ...prev, templateSections: updatedSections };
    });
  };

  const handleRemoveBulletPoint = (sectionId: string, bulletId: string) => {
    setFormData((prev) => {
      const updatedSections = prev.templateSections.map((section) => {
        if (section.id === sectionId && section.type === 'bullet-list') {
          return {
            ...section,
            content: (section.content as BulletPoint[]).filter(
              (bullet) => bullet.id !== bulletId
            ),
          };
        }
        return section;
      });
      return { ...prev, templateSections: updatedSections };
    });
  };

  const handleUpdateBulletPoint = (
    sectionId: string,
    bulletId: string,
    text: string
  ) => {
    setFormData((prev) => {
      const updatedSections = prev.templateSections.map((section) => {
        if (section.id === sectionId && section.type === 'bullet-list') {
          return {
            ...section,
            content: (section.content as BulletPoint[]).map((bullet) =>
              bullet.id === bulletId ? { ...bullet, text } : bullet
            ),
          };
        }
        return section;
      });
      return { ...prev, templateSections: updatedSections };
    });
  };

  // Handle attachments
  const handleAddAttachment = (sectionId: string) => {
    setFormData((prev) => {
      const updatedSections = prev.templateSections.map((section) => {
        if (section.id === sectionId && section.type === 'attachment') {
          return {
            ...section,
            content: [
              ...(section.content as Attachment[]),
              {
                id: `attachment-${Date.now()}`,
                name: 'Nowy załącznik',
                description: ''
              },
            ],
          };
        }
        return section;
      });
      return { ...prev, templateSections: updatedSections };
    });
  };

  const handleRemoveAttachment = (sectionId: string, attachmentId: string) => {
    setFormData((prev) => {
      const updatedSections = prev.templateSections.map((section) => {
        if (section.id === sectionId && section.type === 'attachment') {
          return {
            ...section,
            content: (section.content as Attachment[]).filter(
              (attachment) => attachment.id !== attachmentId
            ),
          };
        }
        return section;
      });
      return { ...prev, templateSections: updatedSections };
    });
  };

  const handleUpdateAttachment = (
    sectionId: string,
    attachmentId: string,
    field: keyof Attachment,
    value: string | File
  ) => {
    setFormData((prev) => {
      const updatedSections = prev.templateSections.map((section) => {
        if (section.id === sectionId && section.type === 'attachment') {
          return {
            ...section,
            content: (section.content as Attachment[]).map((attachment) =>
              attachment.id === attachmentId
                ? { ...attachment, [field]: value }
                : attachment
            ),
          };
        }
        return section;
      });
      return { ...prev, templateSections: updatedSections };
    });
  };

  // Handle file uploads
  const handleFileUpload = (
    sectionId: string,
    attachmentId: string,
    file: File
  ) => {
    // Here you would normally upload the file to your server/storage
    // For demo purposes, we'll just update the attachment with the file info
    handleUpdateAttachment(sectionId, attachmentId, 'file', file);
    handleUpdateAttachment(sectionId, attachmentId, 'name', file.name);

    // Simulate a URL after upload
    setTimeout(() => {
      handleUpdateAttachment(
        sectionId,
        attachmentId,
        'url',
        URL.createObjectURL(file)
      );
    }, 1000);
  };

  // Handle transcript updates
  const handleUpdateTranscript = (
    sectionId: string,
    field: keyof Transcript,
    value: string
  ) => {
    setFormData((prev) => {
      const updatedSections = prev.templateSections.map((section) => {
        if (section.id === sectionId && section.type === 'transcript') {
          return {
            ...section,
            content: {
              ...(section.content as Transcript),
              [field]: value,
            },
          };
        }
        return section;
      });
      return { ...prev, templateSections: updatedSections };
    });
  };

  // Handle text section updates
  const handleUpdateTextSection = (sectionId: string, text: string) => {
    setFormData((prev) => {
      const updatedSections = prev.templateSections.map((section) => {
        if (section.id === sectionId && section.type === 'text') {
          return {
            ...section,
            content: text,
          };
        }
        return section;
      });
      return { ...prev, templateSections: updatedSections };
    });
  };

  // Move sections up or down
  const handleMoveSectionUp = (id: string) => {
    setFormData((prev) => {
      const sections = [...prev.templateSections];
      const index = sections.findIndex(section => section.id === id);

      if (index > 0) {
        // Swap with previous section
        [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];

        // Update order values
        return {
          ...prev,
          templateSections: sections.map((section, idx) => ({
            ...section,
            order: idx
          }))
        };
      }

      return prev;
    });
  };

  const handleMoveSectionDown = (id: string) => {
    setFormData((prev) => {
      const sections = [...prev.templateSections];
      const index = sections.findIndex(section => section.id === id);

      if (index < sections.length - 1) {
        // Swap with next section
        [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];

        // Update order values
        return {
          ...prev,
          templateSections: sections.map((section, idx) => ({
            ...section,
            order: idx
          }))
        };
      }

      return prev;
    });
  };

  // Generate rich text from template sections
  const generateRichTextContent = (): string => {
    const sortedSections = [...formData.templateSections].sort((a, b) => a.order - b.order);

    return sortedSections.map(section => {
      let sectionContent = `<div class="section"><h3>${section.title}</h3>`;

      if (section.type === 'text') {
        sectionContent += `<p>${section.content as string}</p>`;
      }
      else if (section.type === 'bullet-list') {
        sectionContent += '<ul>';
        (section.content as BulletPoint[]).forEach(bullet => {
          sectionContent += `<li>${bullet.text}</li>`;
        });
        sectionContent += '</ul>';
      }
      else if (section.type === 'attachment') {
        sectionContent += '<div class="attachments">';
        (section.content as Attachment[]).forEach(attachment => {
          sectionContent += `
            <div class="attachment">
              <h4>${attachment.name}</h4>
              <p>${attachment.description}</p>
              ${attachment.url ? `<a href="${attachment.url}" target="_blank">Pobierz załącznik</a>` : ''}
            </div>
          `;
        });
        sectionContent += '</div>';
      }
      else if (section.type === 'transcript') {
        const transcript = section.content as Transcript;
        sectionContent += `
          <div class="transcript">
            <h4>${transcript.title}</h4>
            <div>${transcript.content}</div>
            <p class="source">Źródło: ${transcript.source}</p>
          </div>
        `;
      }

      sectionContent += '</div>';
      return sectionContent;
    }).join('');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setAuthError(null);
    setSubmitSuccess(false);

    // Get auth token
    const token = getAuthToken();
    if (!token) {
      setAuthError('Brak autoryzacji. Zaloguj się, aby dodać inicjatywę.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Build rich text content from all sections
      const richTextContent = `
        <div class="initiative-content">
          <div class="summary">
            <p>${formData.summary}</p>
          </div>
          ${generateRichTextContent()}
        </div>
      `;

      // Build the API request payload according to JSON:API spec
      const apiPayload = {
        data: {
          type: "Initiative",
          attributes: {
            title: formData.title,
            description: richTextContent
          },
          relationships: {
            tags: {
              data: formData.tags.map(tag => ({
                type: "tags",
                id: tag
              }))
            }
          }
        }
      };

      console.log('Sending initiative data:', apiPayload);

      // Send POST request to API
      const response = await fetch('http://localhost:8000/api/initiatives/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Brak autoryzacji lub token wygasł. Zaloguj się ponownie.');
        }
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Initiative created:', result);

      setSubmitSuccess(true);

      // Redirect to the initiative after successful creation
      setTimeout(() => {
        router.push(`/initiatives/${result.data.id}`);
      }, 2000);

    } catch (error) {
      console.error('Error submitting initiative:', error);
      if (error instanceof Error && error.message.includes('autoryzacji')) {
        setAuthError(error.message);
      } else {
        setSubmitError(error instanceof Error ? error.message : 'Wystąpił błąd podczas składania inicjatywy');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white text-gray-800">
      {/* Main content */}
      <main className="max-w-4xl mx-auto py-8 px-4">
        {/* Initiative form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-red-900 mb-6">
              Utwórz Nową Inicjatywę Obywatelską
            </h1>

            {/* Success message */}
            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
                <p className="font-medium">Inicjatywa została pomyślnie złożona!</p>
                <p className="mt-1">Za chwilę zostaniesz przekierowany do widoku inicjatywy.</p>
              </div>
            )}

            {/* Auth Error message */}
            {authError && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-md text-orange-800">
                <p className="font-medium">Błąd autoryzacji:</p>
                <p>{authError}</p>
                <a
                  href="/login"
                  className="mt-2 inline-block px-4 py-2 bg-orange-800 text-white rounded hover:bg-orange-700"
                >
                  Zaloguj się
                </a>
              </div>
            )}

            {/* Error message */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
                <p className="font-medium">Błąd:</p>
                <p>{submitError}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-lg font-medium border-b border-gray-300 pb-2 mb-4">
                Informacje Podstawowe
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tytuł Inicjatywy <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Wprowadź jasny, zwięzły tytuł twojej inicjatywy"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Streszczenie <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    placeholder="Krótkie streszczenie twojej inicjatywy (maks. 300 znaków)"
                    maxLength={300}
                    rows={3}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Kategoria <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  >
                    <option value="">Wybierz kategorię</option>
                    <option value="economic">Polityka Gospodarcza</option>
                    <option value="monetary">Polityka Monetarna</option>
                    <option value="environmental">Polityka Środowiskowa</option>
                    <option value="social">Polityka Społeczna</option>
                    <option value="foreign">Polityka Zagraniczna</option>
                    <option value="healthcare">Służba Zdrowia</option>
                    <option value="education">Edukacja</option>
                    <option value="other">Inne</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tagi</label>
                  <div className="flex">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Dodaj tagi"
                      className="w-full border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="bg-red-800 text-white px-4 rounded-r flex items-center"
                    >
                      <PlusCircle size={16} className="mr-1" /> Dodaj
                    </button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-gray-500 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Autor/Organizacja <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Twoje imię lub nazwa organizacji"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Template Sections */}
            <div>
              <h2 className="text-lg font-medium border-b border-gray-300 pb-2 mb-4">
                Treść Inicjatywy
              </h2>

              <p className="text-sm text-gray-600 mb-4">
                Dodaj różne sekcje do swojej inicjatywy, korzystając z szablonów poniżej.
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => handleAddTemplateSection('text')}
                  className="inline-flex items-center px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
                >
                  <Edit size={16} className="mr-2" /> Sekcja Tekstowa
                </button>
                <button
                  type="button"
                  onClick={() => handleAddTemplateSection('bullet-list')}
                  className="inline-flex items-center px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
                >
                  <ListPlus size={16} className="mr-2" /> Lista Punktowana
                </button>
                <button
                  type="button"
                  onClick={() => handleAddTemplateSection('attachment')}
                  className="inline-flex items-center px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
                >
                  <Paperclip size={16} className="mr-2" /> Załączniki
                </button>
                <button
                  type="button"
                  onClick={() => handleAddTemplateSection('transcript')}
                  className="inline-flex items-center px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
                >
                  <FileText size={16} className="mr-2" /> Transkrypt
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                {formData.templateSections.length > 0 ? (
                  <div className="space-y-6">
                    {formData.templateSections
                      .sort((a, b) => a.order - b.order)
                      .map((section) => (
                        <div
                          key={section.id}
                          className="border border-gray-200 rounded-md bg-gray-50 overflow-hidden"
                        >
                          <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
                            <input
                              value={section.title}
                              onChange={(e) =>
                                handleUpdateSectionTitle(section.id, e.target.value)
                              }
                              className="font-medium bg-transparent border-b border-transparent hover:border-gray-400 focus:border-red-500 focus:outline-none"
                            />

                            <div className="flex space-x-1">
                              <button
                                type="button"
                                onClick={() => handleMoveSectionUp(section.id)}
                                disabled={section.order === 0}
                                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                              >
                                <ChevronUp size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveSectionDown(section.id)}
                                disabled={section.order === formData.templateSections.length - 1}
                                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                              >
                                <ChevronDown size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveTemplateSection(section.id)}
                                className="p-1 text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="p-4">
                            {/* Section content based on type */}
                            {section.type === 'text' && (
                              <div>
                                <textarea
                                  value={section.content as string}
                                  onChange={(e) =>
                                    handleUpdateTextSection(section.id, e.target.value)
                                  }
                                  placeholder="Wprowadź treść tekstową..."
                                  rows={5}
                                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                                />
                              </div>
                            )}

                            {section.type === 'bullet-list' && (
                              <div className="space-y-3">
                                {(section.content as BulletPoint[]).map((bullet) => (
                                  <div key={bullet.id} className="flex">
                                    <input
                                      value={bullet.text}
                                      onChange={(e) =>
                                        handleUpdateBulletPoint(
                                          section.id,
                                          bullet.id,
                                          e.target.value
                                        )
                                      }
                                      placeholder="Tekst punktu"
                                      className="w-full border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveBulletPoint(section.id, bullet.id)
                                      }
                                      className="bg-red-100 text-red-600 px-3 rounded-r hover:bg-red-200"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                ))}

                                <button
                                  type="button"
                                  onClick={() => handleAddBulletPoint(section.id)}
                                  className="inline-flex items-center px-3 py-1 text-sm rounded border border-dashed border-gray-400 hover:border-red-500 text-gray-600 hover:text-red-600"
                                >
                                  <PlusCircle size={14} className="mr-1" /> Dodaj Punkt
                                </button>

                                {(section.content as BulletPoint[]).length > 0 && (
                                  <div className="mt-3 p-3 bg-white border border-gray-200 rounded-md">
                                    <p className="text-sm font-medium mb-2">Podgląd:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                      {(section.content as BulletPoint[]).map((bullet) => (
                                        <li key={bullet.id}>
                                          {bullet.text || '(pusty punkt)'}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {section.type === 'attachment' && (
                              <div className="space-y-3">
                                {(section.content as Attachment[]).map((attachment) => (
                                  <div
                                    key={attachment.id}
                                    className="p-3 border border-gray-200 rounded-md bg-white"
                                  >
                                    <div className="flex justify-between items-center mb-2">
                                      <input
                                        value={attachment.name}
                                        onChange={(e) =>
                                          handleUpdateAttachment(
                                            section.id,
                                            attachment.id,
                                            'name',
                                            e.target.value
                                          )
                                        }
                                        placeholder="Nazwa załącznika"
                                        className="border-b border-transparent hover:border-gray-400 focus:border-red-500 focus:outline-none"
                                      />

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveAttachment(section.id, attachment.id)
                                        }
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>

                                    <div className="space-y-2">
                                      <label className="block text-xs font-medium">Opis</label>
                                      <textarea
                                        value={attachment.description}
                                        onChange={(e) =>
                                          handleUpdateAttachment(
                                            section.id,
                                            attachment.id,
                                            'description',
                                            e.target.value
                                          )
                                        }
                                        placeholder="Opisz załącznik (opcjonalnie)"
                                        rows={2}
                                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                                      />
                                    </div>

                                    <div className="mt-3">
                                      <label className="block text-xs font-medium">Plik</label>
                                      <input
                                        type="file"
                                        onChange={(e) => {
                                          if (
                                            e.target.files &&
                                            e.target.files.length > 0
                                          ) {
                                            handleFileUpload(
                                              section.id,
                                              attachment.id,
                                              e.target.files[0]
                                            );
                                          }
                                        }}
                                        className="text-sm mt-1"
                                      />
                                    </div>

                                    {attachment.url && (
                                      <p className="text-sm text-green-600 mt-2 flex items-center">
                                        <span className="inline-block w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-1">✓</span>
                                        Plik przesłany pomyślnie
                                      </p>
                                    )}
                                  </div>
                                ))}

                                <button
                                  type="button"
                                  onClick={() => handleAddAttachment(section.id)}
                                  className="inline-flex items-center px-3 py-1 text-sm rounded border border-dashed border-gray-400 hover:border-red-500 text-gray-600 hover:text-red-600"
                                >
                                  <PlusCircle size={14} className="mr-1" /> Dodaj Załącznik
                                </button>
                              </div>
                            )}

                            {section.type === 'transcript' && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Tytuł Transkryptu
                                  </label>
                                  <input
                                    value={(section.content as Transcript).title}
                                    onChange={(e) =>
                                      handleUpdateTranscript(
                                        section.id,
                                        'title',
                                        e.target.value
                                      )
                                    }
                                    placeholder="Tytuł transkryptu"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Treść Transkryptu
                                  </label>
                                  <textarea
                                    value={(section.content as Transcript).content}
                                    onChange={(e) =>
                                      handleUpdateTranscript(
                                        section.id,
                                        'content',
                                        e.target.value
                                      )
                                    }
                                    placeholder="Wklej tekst transkryptu tutaj"
                                    rows={8}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Źródło
                                  </label>
                                  <input
                                    value={(section.content as Transcript).source}
                                    onChange={(e) =>
                                      handleUpdateTranscript(
                                        section.id,
                                        'source',
                                        e.target.value
                                      )
                                    }
                                    placeholder="Źródło transkryptu"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">
                      Nie dodano jeszcze żadnych sekcji. Użyj przycisków powyżej, aby dodać treść do swojej inicjatywy.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-4 w-full md:w-auto px-6 py-3 bg-red-800 hover:bg-red-700 text-white rounded-md font-medium flex items-center justify-center"
            disabled={
              isSubmitting ||
              !formData.title ||
              !formData.summary ||
              !formData.category ||
              !formData.author ||
              formData.templateSections.length === 0
            }
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Wysyłanie...</span>
              </>
            ) : (
              <>
                <span>Złóż Inicjatywę</span>
                <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default SejmofilInitiativeForm;