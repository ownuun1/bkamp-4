export interface RemoteOKJob {
  externalId: string;
  title: string;
  company: string;
  description: string;
  link: string;
  pubDate: string;
  salary: {
    min: number | null;
    max: number | null;
  };
  tags: string[];
  location: string;
}

interface RemoteOKAPIResponse {
  id: string;
  slug: string;
  position: string;
  company: string;
  description: string;
  date: string;
  tags: string[];
  location: string;
  salary_min?: number;
  salary_max?: number;
  url: string;
  apply_url: string;
}

// Clean HTML from description
function cleanDescription(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 5000); // Limit description length
}

export async function fetchRemoteOKJobs(): Promise<RemoteOKJob[]> {
  try {
    const response = await fetch('https://remoteok.com/api', {
      headers: {
        'User-Agent': 'JobHunt/1.0 (Job Aggregator)',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RemoteOK API: ${response.status}`);
    }

    const data: RemoteOKAPIResponse[] = await response.json();

    // First item is metadata, skip it
    const jobs = data.slice(1);

    return jobs.map((job) => ({
      externalId: job.id,
      title: job.position,
      company: job.company,
      description: cleanDescription(job.description || ''),
      link: job.url || job.apply_url,
      pubDate: job.date,
      salary: {
        min: job.salary_min && job.salary_min > 0 ? job.salary_min : null,
        max: job.salary_max && job.salary_max > 0 ? job.salary_max : null,
      },
      tags: job.tags || [],
      location: job.location || 'Remote',
    }));
  } catch (error) {
    console.error('Error fetching RemoteOK jobs:', error);
    return [];
  }
}
