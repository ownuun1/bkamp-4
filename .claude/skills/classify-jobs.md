# /classify-jobs

Classify uncategorized job postings in the database using LLM.

## Trigger
- User says "/classify-jobs" or "classify jobs" or "분류 안된 공고 분류해줘"

## Steps

1. Query database for uncategorized jobs:
```sql
SELECT id, title, description FROM jobhunt_postings WHERE category IS NULL LIMIT 50;
```

2. For each job, use the classifyJobCategory function from `apps/jobhunt/src/lib/openai.ts`:
```typescript
import { classifyJobCategory } from '@/lib/openai';

const category = await classifyJobCategory(job.title, job.description);
```

3. Update the database with the classification:
```sql
UPDATE jobhunt_postings SET category = '{category}' WHERE id = '{id}';
```

4. Report results:
- Total uncategorized jobs found
- Jobs successfully classified
- Classification breakdown by category
- Any errors encountered

## Categories
- dev (software development, programming, engineering, DevOps, QA)
- design (UI/UX, graphic design, product design, web design)
- marketing (SEO, content marketing, growth, social media, ads)
- sales (sales, business development, account management)
- support (customer support, customer success, community)
- data (data science, analytics, ML/AI, data engineering)
- writing (copywriting, content creation, technical writing, editing)
- other (everything else)

## Example Output

```
Classified 45 job postings:
- dev: 20
- design: 8
- marketing: 6
- data: 5
- sales: 3
- support: 2
- writing: 1
- other: 0

All jobs successfully classified!
```

## Notes
- This is useful for initial data migration or when jobs were imported without classification
- The sync API now auto-classifies new jobs, so this is mainly for cleanup
- Rate limiting may apply if processing many jobs at once
