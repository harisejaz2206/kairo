import { MigrationInterface, QueryRunner } from "typeorm";

export class RelaxJobsDedupeKeyAndAddJobScoreUniqueness1776441000000 implements MigrationInterface {
    name = 'RelaxJobsDedupeKeyAndAddJobScoreUniqueness1776441000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_ce288f50d13f64c22330d2afa7"`);
        await queryRunner.query(`CREATE INDEX "IDX_ce288f50d13f64c22330d2afa7" ON "jobs" ("dedupe_key") `);
        await queryRunner.query(`ALTER TABLE "job_scores" ADD CONSTRAINT "UQ_4252474f5c3739a7d448f866fed" UNIQUE ("job_id", "candidate_profile_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job_scores" DROP CONSTRAINT "UQ_4252474f5c3739a7d448f866fed"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ce288f50d13f64c22330d2afa7"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ce288f50d13f64c22330d2afa7" ON "jobs" ("dedupe_key") `);
    }
}
