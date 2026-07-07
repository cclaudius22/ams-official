import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { mapDeepSetReview } from '@/data/providers/deepSetReviewAdapter'

/**
 * No-fallback guarantee (Task 4c — Rachel Johnson is the dedicated deep-review
 * officer for ALL 18 deep_set cases).
 *
 * Rachel's reviewer queue is scoped to exactly the enriched deep_set corpus, so
 * every file in it must map through `mapDeepSetReview` to a non-null `disView`
 * AND a non-null `ovAssessment` — i.e. no case she can open ever degrades to
 * `mockDISApplicationView` / `syntheticOvAssessment()`. This is a guarantee pin:
 * it should already hold given the corpus is fully enriched (Slice 3a), but a
 * future corpus edit that half-writes a record must fail this test, not surface
 * as a silent mock fallback in her queue.
 */
const CORPUS_DIR = path.join(process.cwd(), 'data/demo-corpus/deep_set/applications')

describe('deep_set corpus — no-fallback guarantee for Rachel Johnson (officer-demo)', () => {
  const files = fs.readdirSync(CORPUS_DIR).filter((f) => f.endsWith('.json'))

  it('has exactly 18 deep_set application files', () => {
    expect(files).toHaveLength(18)
  })

  it.each(files)('%s maps to a non-null disView AND non-null ovAssessment', (file) => {
    const raw = JSON.parse(fs.readFileSync(path.join(CORPUS_DIR, file), 'utf-8'))
    const review = mapDeepSetReview(raw)
    expect(review).not.toBeNull()
    expect(review!.disView).not.toBeNull()
    expect(review!.ovAssessment).not.toBeNull()
  })
})
