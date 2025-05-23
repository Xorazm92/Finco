import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HumanFeedback } from './human-feedback.entity';

@Injectable()
export class HumanFeedbackService {
  constructor(
    @InjectRepository(HumanFeedback) private feedbackRepo: Repository<HumanFeedback>,
  ) {}

  /**
   * Give feedback for an AI result. Updates if already exists for this supervisor/result.
   */
  async giveFeedback(aiResultId: number, supervisorId: string, feedback: string, comment?: string): Promise<HumanFeedback> {
    let entity = await this.feedbackRepo.findOne({ where: { aiResultId, supervisorId } });
    if (entity) {
      entity.feedback = feedback;
      entity.comment = comment;
    } else {
      entity = this.feedbackRepo.create({ aiResultId, supervisorId, feedback, comment });
    }
    return this.feedbackRepo.save(entity);
  }

  /**
   * Get all feedback for a specific AI result.
   */
  async getFeedbackForResult(aiResultId: number): Promise<HumanFeedback[]> {
    return this.feedbackRepo.find({ where: { aiResultId } });
  }

  /**
   * Get IDs of AI results that have not received any feedback yet.
   */
  async getPendingAiResultsForReview(limit = 10): Promise<number[]> {
    const entityManager = this.feedbackRepo.manager;
    const results = await entityManager.query(`
      SELECT r.id FROM ai_analysis_result r
      LEFT JOIN human_feedback f ON r.id = f.aiResultId
      WHERE f.id IS NULL
      ORDER BY r.createdAt ASC
      LIMIT $1
    `, [limit]);
    return results.map((row: any) => row.id);
  }

  /**
   * Get feedback statistics (count per feedback type) for the last N feedbacks.
   */
  async getFeedbackStats(limit = 20): Promise<{feedback: string, count: number}[]> {
    const entityManager = this.feedbackRepo.manager;
    // Get feedback counts for the last N feedbacks
    const results = await entityManager.query(`
      SELECT f.feedback, COUNT(*) as count
      FROM (
        SELECT * FROM human_feedback ORDER BY createdAt DESC LIMIT $1
      ) f
      GROUP BY f.feedback
      ORDER BY count DESC
    `, [limit]);
    return results;
  }

  /**
   * Get feedback statistics grouped by supervisor for the last N feedbacks.
   */
  async getOperatorFeedbackStats(limit = 20): Promise<{supervisorId: string, feedback: string, count: number}[]> {
    const entityManager = this.feedbackRepo.manager;
    // Get feedback counts grouped by supervisorId for the last N feedbacks
    const results = await entityManager.query(`
      SELECT f.supervisorId, f.feedback, COUNT(*) as count
      FROM (
        SELECT * FROM human_feedback ORDER BY createdAt DESC LIMIT $1
      ) f
      GROUP BY f.supervisorId, f.feedback
      ORDER BY f.supervisorId, count DESC
    `, [limit]);
    return results;
  }

  /**
   * Get detailed feedback statistics grouped by supervisor and AI result type for the last N feedbacks.
   */
  async getOperatorFeedbackStatsDetailed(limit = 20): Promise<{supervisorId: string, feedback: string, resultType: string, count: number}[]> {
    const entityManager = this.feedbackRepo.manager;
    // Get feedback counts grouped by supervisorId, feedback, and resultType for the last N feedbacks
    const results = await entityManager.query(`
      SELECT f.supervisorId, f.feedback, r.resultType, COUNT(*) as count
      FROM (
        SELECT * FROM human_feedback ORDER BY createdAt DESC LIMIT $1
      ) f
      JOIN ai_analysis_result r ON f.aiResultId = r.id
      GROUP BY f.supervisorId, f.feedback, r.resultType
      ORDER BY f.supervisorId, r.resultType, f.feedback, count DESC
    `, [limit]);
    return results;
  }
}
