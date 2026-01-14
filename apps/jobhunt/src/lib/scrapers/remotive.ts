export interface RemotiveJob {
  externalId: string;
  title: string;
  company: string;
  description: string;
  link: string;
  pubDate: string;
  salary: string | null;
  tags: string[];
  location: string;
  category: string;
  jobType: string;
}

interface RemotiveAPIJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  description: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  category: string;
  job_type: string;
  tags: string[];
}

interface RemotiveAPIResponse {
  jobs: RemotiveAPIJob[];
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

export async function fetchRemotiveJobs(): Promise<RemotiveJob[]> {
  try {
    const response = await fetch('https://remotive.com/api/remote-jobs', {
      headers: {
        'User-Agent': 'JobHunt/1.0 (Job Aggregator)',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Remotive API: ${response.status}`);
    }

    const data: RemotiveAPIResponse = await response.json();

    return data.jobs.map((job) => ({
      externalId: job.id.toString(),
      title: job.title,
      company: job.company_name,
      description: cleanDescription(job.description || ''),
      link: job.url,
      pubDate: job.publication_date,
      salary: job.salary || null,
      tags: job.tags || [],
      location: job.candidate_required_location || 'Worldwide',
      category: job.category,
      jobType: job.job_type,
    }));
  } catch (error) {
    console.error('Error fetching Remotive jobs:', error);
    return [];
  }
}
