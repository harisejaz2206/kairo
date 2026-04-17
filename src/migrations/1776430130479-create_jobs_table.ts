import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJobsTable1776430130479 implements MigrationInterface {
    name = 'CreateJobsTable1776430130479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."jobs_workplace_type_enum" AS ENUM('remote', 'hybrid', 'onsite', 'unknown')`);
        await queryRunner.query(`CREATE TYPE "public"."jobs_employment_type_enum" AS ENUM('full_time', 'part_time', 'contract', 'internship', 'temporary', 'unknown')`);
        await queryRunner.query(`CREATE TYPE "public"."jobs_seniority_hint_enum" AS ENUM('intern', 'junior', 'mid', 'senior', 'lead', 'staff', 'unknown')`);
        await queryRunner.query(`CREATE TABLE "jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "source_id" uuid NOT NULL, "external_job_id" character varying(255), "external_company_id" character varying(255), "source_job_url" text NOT NULL, "company_name" character varying(255) NOT NULL, "title" character varying(255) NOT NULL, "location_raw" character varying(255), "city_normalized" character varying(100), "country_normalized" character varying(100), "workplace_type" "public"."jobs_workplace_type_enum" NOT NULL DEFAULT 'unknown', "employment_type" "public"."jobs_employment_type_enum" NOT NULL DEFAULT 'unknown', "seniority_hint" "public"."jobs_seniority_hint_enum" NOT NULL DEFAULT 'unknown', "language_requirements" jsonb, "relocation_supported" boolean, "visa_sponsorship_signal" boolean, "description_text" text NOT NULL, "requirements_text" text, "tech_keywords" jsonb, "posted_at" TIMESTAMP, "fetched_at" TIMESTAMP NOT NULL, "first_seen_at" TIMESTAMP NOT NULL, "last_seen_at" TIMESTAMP NOT NULL, "source_payload_json" jsonb NOT NULL, "content_hash" character varying(64) NOT NULL, "dedupe_key" character varying(500) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9610402f45362b977fb1ec08b3" ON "jobs" ("content_hash") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ce288f50d13f64c22330d2afa7" ON "jobs" ("dedupe_key") `);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_a1475802e19ed333a80fa79ee1a" FOREIGN KEY ("source_id") REFERENCES "job_sources"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_a1475802e19ed333a80fa79ee1a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ce288f50d13f64c22330d2afa7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9610402f45362b977fb1ec08b3"`);
        await queryRunner.query(`DROP TABLE "jobs"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_seniority_hint_enum"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_employment_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_workplace_type_enum"`);
    }

}
