import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateApplicationsTable1776430214663 implements MigrationInterface {
    name = 'CreateApplicationsTable1776430214663'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."applications_status_enum" AS ENUM('new', 'shortlisted', 'draft_generated', 'reviewed', 'applied', 'rejected', 'interview', 'offer', 'archived')`);
        await queryRunner.query(`CREATE TYPE "public"."applications_priority_enum" AS ENUM('low', 'medium', 'high')`);
        await queryRunner.query(`CREATE TYPE "public"."applications_fit_label_enum" AS ENUM('weak', 'decent', 'strong', 'exceptional')`);
        await queryRunner.query(`CREATE TABLE "applications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_id" uuid NOT NULL, "candidate_profile_id" uuid NOT NULL, "status" "public"."applications_status_enum" NOT NULL DEFAULT 'new', "priority" "public"."applications_priority_enum" NOT NULL DEFAULT 'medium', "fit_label" "public"."applications_fit_label_enum", "manual_notes" text, "rejection_reason" character varying(255), "applied_at" TIMESTAMP, "last_status_changed_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_91c39fa3e7d9e2c3e476d57bee8" UNIQUE ("job_id", "candidate_profile_id"), CONSTRAINT "PK_938c0a27255637bde919591888f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "applications" ADD CONSTRAINT "FK_8aba14d7f098c23ba06d8693235" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "applications" ADD CONSTRAINT "FK_f7e54490e3246c80605028062b6" FOREIGN KEY ("candidate_profile_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applications" DROP CONSTRAINT "FK_f7e54490e3246c80605028062b6"`);
        await queryRunner.query(`ALTER TABLE "applications" DROP CONSTRAINT "FK_8aba14d7f098c23ba06d8693235"`);
        await queryRunner.query(`DROP TABLE "applications"`);
        await queryRunner.query(`DROP TYPE "public"."applications_fit_label_enum"`);
        await queryRunner.query(`DROP TYPE "public"."applications_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."applications_status_enum"`);
    }

}
