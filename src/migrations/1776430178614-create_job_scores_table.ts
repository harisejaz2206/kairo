import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJobScoresTable1776430178614 implements MigrationInterface {
    name = 'CreateJobScoresTable1776430178614'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "job_scores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_id" uuid NOT NULL, "candidate_profile_id" uuid NOT NULL, "overall_score" numeric(4,2) NOT NULL, "title_match_score" numeric(4,2), "stack_match_score" numeric(4,2), "location_match_score" numeric(4,2), "experience_match_score" numeric(4,2), "visa_signal_score" numeric(4,2), "remote_match_score" numeric(4,2), "red_flags_json" jsonb NOT NULL DEFAULT '[]', "strengths_json" jsonb NOT NULL DEFAULT '[]', "explanation_json" jsonb, "scoring_model" character varying(100), "scoring_version" character varying(50), "scored_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d67d677f0c23b52aff5d23c88fb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "job_scores" ADD CONSTRAINT "FK_332678859d85c3ce3147ad82652" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_scores" ADD CONSTRAINT "FK_6a18a9dbbd3ebe4bad1305875e5" FOREIGN KEY ("candidate_profile_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job_scores" DROP CONSTRAINT "FK_6a18a9dbbd3ebe4bad1305875e5"`);
        await queryRunner.query(`ALTER TABLE "job_scores" DROP CONSTRAINT "FK_332678859d85c3ce3147ad82652"`);
        await queryRunner.query(`DROP TABLE "job_scores"`);
    }

}
