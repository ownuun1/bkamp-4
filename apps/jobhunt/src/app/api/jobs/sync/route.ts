import { NextResponse } from 'next/server';
import { createClient } from '@bkamp/supabase/server';
import { fetchRemoteOKJobs } from '@/lib/scrapers/remoteok';
import { fetchRemotiveJobs } from '@/lib/scrapers/remotive';
import { classifyJobCategory } from '@/lib/openai';

// This endpoint can be called by a cron job (e.g., Vercel Cron)
// or manually to sync jobs from RemoteOK and Remotive
export async function POST(request: Request) {
  try {
    // Verify cron secret for automated calls
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // If CRON_SECRET is set, require authorization
      // Skip check if not set (for development)
      if (authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabase = await createClient();

    const stats = {
      remoteok: { fetched: 0, inserted: 0, errors: 0 },
      remotive: { fetched: 0, inserted: 0, errors: 0 },
      classified: 0,
    };

    // Fetch jobs from RemoteOK
    console.log('Fetching jobs from RemoteOK...');
    const remoteOKJobs = await fetchRemoteOKJobs();
    stats.remoteok.fetched = remoteOKJobs.length;
    console.log(`Fetched ${remoteOKJobs.length} jobs from RemoteOK`);

    // Fetch jobs from Remotive
    console.log('Fetching jobs from Remotive...');
    const remotiveJobs = await fetchRemotiveJobs();
    stats.remotive.fetched = remotiveJobs.length;
    console.log(`Fetched ${remotiveJobs.length} jobs from Remotive`);

    // Process RemoteOK jobs
    for (const job of remoteOKJobs) {
      try {
        // Classify job category using LLM
        const category = await classifyJobCategory(job.title, job.description);
        stats.classified++;

        const { error } = await supabase.from('jobhunt_postings').upsert(
          {
            platform: 'remoteok',
            external_id: job.externalId,
            title: job.title,
            company_name: job.company,
            description: job.description,
            external_url: job.link,
            salary_min: job.salary.min,
            salary_max: job.salary.max,
            salary_type: 'yearly',
            skills_required: job.tags,
            location: job.location,
            category,
            raw_data: job,
            created_at: new Date(job.pubDate).toISOString(),
          },
          {
            onConflict: 'platform,external_id',
            ignoreDuplicates: false,
          }
        );

        if (error) {
          console.error('Error upserting RemoteOK job:', error);
          stats.remoteok.errors++;
        } else {
          stats.remoteok.inserted++;
        }
      } catch (err) {
        console.error('Error processing RemoteOK job:', err);
        stats.remoteok.errors++;
      }
    }

    // Process Remotive jobs
    for (const job of remotiveJobs) {
      try {
        // Classify job category using LLM
        const category = await classifyJobCategory(job.title, job.description);
        stats.classified++;

        const { error } = await supabase.from('jobhunt_postings').upsert(
          {
            platform: 'remotive',
            external_id: job.externalId,
            title: job.title,
            company_name: job.company,
            description: job.description,
            external_url: job.link,
            salary_min: null, // Remotive doesn't provide structured salary
            salary_max: null,
            salary_type: null,
            skills_required: job.tags,
            location: job.location,
            category,
            raw_data: job,
            created_at: new Date(job.pubDate).toISOString(),
          },
          {
            onConflict: 'platform,external_id',
            ignoreDuplicates: false,
          }
        );

        if (error) {
          console.error('Error upserting Remotive job:', error);
          stats.remotive.errors++;
        } else {
          stats.remotive.inserted++;
        }
      } catch (err) {
        console.error('Error processing Remotive job:', err);
        stats.remotive.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Job sync error:', error);
    return NextResponse.json({ error: 'Failed to sync jobs' }, { status: 500 });
  }
}

// GET endpoint to check sync status
export async function GET() {
  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from('jobhunt_postings')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    // Get counts by platform
    const { data: platformCounts } = await supabase
      .from('jobhunt_postings')
      .select('platform')
      .limit(1000);

    const platforms: Record<string, number> = {};
    platformCounts?.forEach((row) => {
      platforms[row.platform] = (platforms[row.platform] || 0) + 1;
    });

    // Get counts by category
    const { data: categoryCounts } = await supabase
      .from('jobhunt_postings')
      .select('category')
      .limit(1000);

    const categories: Record<string, number> = {};
    categoryCounts?.forEach((row) => {
      const cat = row.category || 'uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    const { data: latest } = await supabase
      .from('jobhunt_postings')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      totalJobs: count,
      platforms,
      categories,
      lastSync: latest?.created_at || null,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}
